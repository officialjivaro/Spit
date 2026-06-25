<template>
  <section class="home-view app-page">
    <div class="home-card glass-panel">
      <div class="home-card__heading">
        <p class="home-card__eyebrow text-effect">A quiet puzzle among the blossoms</p>
        <h1 class="home-card__title display-title">SUDOKU</h1>
      </div>

      <GameModeSelector v-model="mode" />

      <div class="home-card__setup">
        <DifficultySelector v-if="showDifficulty" v-model="difficulty" />
        <p v-else class="home-card__daily-note">
          {{ dailyStatusMessage }}
        </p>
        <ToggleSwitch label="Music" :model-value="isPlaying" @update:model-value="handleMusicChange" />
      </div>

      <LocalStatsSummary :stats="stats" />

      <p v-if="errorMessage || online.state.startError" class="home-card__message" role="status">
        {{ errorMessage || online.state.startError }}
      </p>

      <AppButton class="home-card__play" :disabled="isStarting" @click="beginGame">
        {{ isStarting ? 'Preparing…' : callToAction }}
      </AppButton>
    </div>
  </section>
</template>

<script setup>
import { computed, nextTick, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import GameModeSelector from '../components/home/GameModeSelector.vue'
import LocalStatsSummary from '../components/home/LocalStatsSummary.vue'
import DifficultySelector from '../components/home/DifficultySelector.vue'
import AppButton from '../components/ui/AppButton.vue'
import ToggleSwitch from '../components/ui/ToggleSwitch.vue'
import { useAudioPlayer } from '../composables/useAudioPlayer.js'
import { useOnlineAccount } from '../composables/useOnlineAccount.js'
import { useSudokuOnline } from '../composables/useSudokuOnline.js'
import { useGameSession } from '../composables/useGameSession.js'
import { usePlayerStats } from '../composables/usePlayerStats.js'
import { GAME_MODES } from '../constants/gameModes.js'
import { getUtcDateKey } from '../services/dailyChallengeService.js'
import { createId } from '../utils/createId.js'

const router = useRouter()
const mode = ref('classic')
const difficulty = ref('easy')
const isStarting = ref(false)
const { isPlaying, errorMessage, setPlaying } = useAudioPlayer()
const { game, startGame, showStoredResult, attachOnlineRun } = useGameSession()
const account = useOnlineAccount()
const online = useSudokuOnline()
const { stats, refreshStats } = usePlayerStats()

const selectedMode = computed(() => GAME_MODES[mode.value])
const showDifficulty = computed(() => !selectedMode.value.fixedDifficulty)
const dailyStatusMessage = computed(() => {
  if (stats.dailyCompletion) {
    return 'Today’s challenge is complete. Your result is ready to revisit.'
  }

  if (stats.dailyProgress) {
    return 'Your Daily Challenge is saved on this device and ready to resume.'
  }

  return 'Everyone receives the same Medium puzzle for the current UTC date.'
})

const callToAction = computed(() => {
  if (mode.value === 'daily') {
    if (stats.dailyCompletion) {
      return 'View Today’s Result'
    }

    return stats.dailyProgress ? 'Resume Daily Challenge' : 'Start Daily Challenge'
  }

  return {
    classic: 'Play Classic',
    sprint: 'Start Sprint',
    zen: 'Enter Zen'
  }[mode.value]
})

onMounted(() => refreshStats())

async function handleMusicChange(value) {
  await setPlaying(value)
}

async function beginGame() {
  if (isStarting.value) {
    return
  }

  isStarting.value = true
  await nextTick()

  try {
    if (mode.value === 'daily' && stats.dailyCompletion) {
      showStoredResult(stats.dailyCompletion)
      await router.push({ name: 'end' })
      return
    }

    const selectedDifficulty = selectedMode.value.fixedDifficulty || difficulty.value
    const dailyDate = mode.value === 'daily' ? getUtcDateKey() : null
    const clientRunId = createId()
    online.clearResultStatus()

    const onlineRun = await online.prepareRun({
      mode: mode.value,
      difficulty: selectedDifficulty,
      dailyDate,
      clientRunId
    }, account.isAuthenticated.value)

    startGame({
      mode: mode.value,
      difficulty: selectedDifficulty,
      dateKey: dailyDate,
      clientRunId,
      onlineRun,
      generatedPuzzle: onlineRun
        ? { puzzle: onlineRun.puzzle, solution: onlineRun.solution }
        : null
    })

    if (onlineRun && !game.onlineRunToken) {
      attachOnlineRun(onlineRun)
    }

    if (game.status === 'completed') {
      await router.push({ name: 'end' })
      return
    }

    await router.push({
      name: 'game',
      query: {
        mode: mode.value,
        difficulty: selectedDifficulty
      }
    })
  } finally {
    isStarting.value = false
  }
}
</script>

<style scoped>
.home-view {
  padding: clamp(0.45rem, 1.2vmin, 0.9rem);
}

.home-card {
  display: grid;
  justify-items: center;
  gap: clamp(0.55rem, 1.25dvh, 0.95rem);
  inline-size: min(96vw, 68rem);
  max-block-size: calc(100% - 0.5rem);
  padding: clamp(0.8rem, 2vmin, 1.4rem);
}

.home-card__heading {
  display: grid;
  justify-items: center;
  gap: 0.05rem;
}

.home-card__eyebrow {
  margin: 0;
  font-size: clamp(0.66rem, 1.35vmin, 0.86rem);
  letter-spacing: 0.06em;
  text-align: center;
}

.home-card__title {
  margin: 0;
  font-size: clamp(3rem, 8.6vmin, 6rem);
  line-height: 0.92;
}

.home-card__setup {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: clamp(0.65rem, 2.2vw, 1.5rem);
}

.home-card__daily-note {
  max-inline-size: 30rem;
  margin: 0;
  color: rgba(37, 33, 36, 0.84);
  font-size: clamp(0.72rem, 1.45vmin, 0.9rem);
  font-weight: 750;
  text-align: center;
}

.home-card__message {
  max-inline-size: 30rem;
  margin: 0;
  color: #692a3d;
  font-size: 0.82rem;
  font-weight: 800;
  text-align: center;
}

.home-card__play {
  min-inline-size: clamp(9rem, 17vmin, 12rem);
}

@media (max-height: 40rem) {
  .home-card {
    gap: 0.35rem;
    padding-block: 0.55rem;
  }

  .home-card__title {
    font-size: clamp(2.7rem, 7vmin, 4.5rem);
  }

  .home-card__eyebrow,
  .home-card__daily-note {
    display: none;
  }
}
</style>

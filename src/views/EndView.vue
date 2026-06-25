<template>
  <section class="end-view app-page">
    <div v-if="result" class="end-card glass-panel">
      <h1 class="end-card__title display-title">Did you know…</h1>

      <ResultSummary :result="result" />

      <OnlineResultStatus
        v-if="result.status === 'completed'"
        :submitting="online.state.submitting"
        :message="onlineResultMessage"
        :error="online.state.submissionError"
      />

      <p class="end-card__fact text-effect">
        <span v-for="(line, index) in factLines" :key="`${line}-${index}`">{{ line }}</span>
      </p>

      <ResultActions
        :can-retry="result.mode !== 'daily'"
        :copy-label="copyLabel"
        @retry="retryGame"
        @copy="copyResult"
        @home="returnHome"
      />
    </div>
  </section>
</template>

<script setup>
import { computed, onBeforeMount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import facts from '../assets/data/facts.json'
import OnlineResultStatus from '../components/end/OnlineResultStatus.vue'
import ResultActions from '../components/end/ResultActions.vue'
import ResultSummary from '../components/end/ResultSummary.vue'
import { useEconomy } from '../composables/useEconomy.js'
import { useGameSession } from '../composables/useGameSession.js'
import { useOnlineAccount } from '../composables/useOnlineAccount.js'
import { useSudokuOnline } from '../composables/useSudokuOnline.js'
import { pickRandomFact, splitFactIntoLines } from '../utils/factLines.js'
import { buildResultSummary } from '../utils/resultSummary.js'
import { createId } from '../utils/createId.js'

const router = useRouter()
const { game, startGame, abandonGame } = useGameSession()
const account = useOnlineAccount()
const economy = useEconomy()
const online = useSudokuOnline()
const copyLabel = ref('Copy Result')
const selectedFact = pickRandomFact(facts)
const factLines = splitFactIntoLines(selectedFact)
const result = computed(() => game.lastResult)
const onlineResultMessage = computed(() => [
  online.state.submissionMessage,
  economy.state.lastReward?.message
].filter(Boolean).join(' '))

onBeforeMount(() => {
  if (!game.lastResult) {
    router.replace({ name: 'home' })
  }
})

onMounted(async () => {
  if (!result.value || result.value.status !== 'completed') {
    return
  }

  economy.clearLastReward()

  if (!account.isAuthenticated.value) {
    economy.awardGuestResult(result.value)
    return
  }

  const response = await online.submitResult(result.value, true)

  if (response) {
    economy.applyServerReward(response)
  }
})

async function retryGame() {
  const mode = result.value.mode
  const difficulty = result.value.difficulty
  const clientRunId = createId()
  online.clearResultStatus()
  const onlineRun = await online.prepareRun({ mode, difficulty, clientRunId }, account.isAuthenticated.value)

  startGame({
    mode,
    difficulty,
    forceNew: true,
    clientRunId,
    onlineRun,
    generatedPuzzle: onlineRun
      ? { puzzle: onlineRun.puzzle, solution: onlineRun.solution }
      : null
  })
  await router.replace({ name: 'game', query: { mode, difficulty } })
}

async function copyResult() {
  const text = buildResultSummary(result.value)

  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
    } else {
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.opacity = '0'
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      textArea.remove()
    }

    copyLabel.value = 'Copied'
  } catch {
    copyLabel.value = 'Copy failed'
  }

  window.setTimeout(() => {
    copyLabel.value = 'Copy Result'
  }, 1600)
}

async function returnHome() {
  abandonGame({ preserveDaily: false })
  await router.push({ name: 'home' })
}
</script>

<style scoped>
.end-view {
  padding: clamp(0.55rem, 1.4vmin, 1rem);
}

.end-card {
  display: grid;
  justify-items: center;
  gap: clamp(0.65rem, 1.5dvh, 1rem);
  inline-size: min(94vw, 54rem);
  max-block-size: calc(100% - 0.5rem);
  padding: clamp(0.85rem, 2.4vmin, 1.7rem);
  text-align: center;
}

.end-card__title {
  margin: 0;
  font-size: clamp(2.8rem, 8.5vmin, 6.2rem);
  line-height: 0.95;
}

.end-card__fact {
  display: grid;
  gap: 0.08rem;
  margin: 0;
  font-size: clamp(0.9rem, 1.9vmin, 1.25rem);
  line-height: 1.3;
}

.end-card__fact span {
  display: block;
}

@media (max-height: 38rem) {
  .end-card {
    gap: 0.4rem;
    padding-block: 0.55rem;
  }

  .end-card__title {
    font-size: clamp(2.2rem, 6.5vmin, 4rem);
  }

  .end-card__fact {
    font-size: 0.78rem;
  }
}
</style>

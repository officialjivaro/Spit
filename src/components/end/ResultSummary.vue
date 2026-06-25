<template>
  <section class="result-summary" aria-label="Game result">
    <p class="result-summary__headline text-effect">
      {{ result.status === 'expired' ? 'Time expired' : 'Puzzle complete' }}
    </p>
    <div class="result-summary__grid">
      <div class="result-summary__item">
        <span>Mode</span>
        <strong>{{ modeLabel }}</strong>
      </div>
      <div class="result-summary__item">
        <span>Difficulty</span>
        <strong>{{ difficultyLabel }}</strong>
      </div>
      <div v-if="result.mode !== 'zen'" class="result-summary__item">
        <span>Time</span>
        <strong>{{ formattedTime }}</strong>
      </div>
      <div v-if="result.mode !== 'zen'" class="result-summary__item">
        <span>Mistakes</span>
        <strong>{{ result.mistakes }}</strong>
      </div>
      <div class="result-summary__item">
        <span>Hints used</span>
        <strong>{{ result.hintsUsed }}</strong>
      </div>
      <div v-if="result.dailyDate" class="result-summary__item">
        <span>Daily streak</span>
        <strong>{{ result.currentDailyStreak || 0 }}</strong>
      </div>
    </div>
    <p v-if="result.isPersonalBest" class="result-summary__badge">New personal best</p>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { DIFFICULTIES } from '../../constants/difficulties.js'
import { GAME_MODES } from '../../constants/gameModes.js'
import { formatTime } from '../../utils/formatTime.js'

const props = defineProps({
  result: {
    type: Object,
    required: true
  }
})

const modeLabel = computed(() => GAME_MODES[props.result.mode]?.label || 'Sudoku')
const difficultyLabel = computed(() => DIFFICULTIES[props.result.difficulty]?.label || 'Easy')
const formattedTime = computed(() => formatTime(props.result.elapsedSeconds || 0))
</script>

<style scoped>
.result-summary {
  display: grid;
  justify-items: center;
  gap: 0.7rem;
  inline-size: 100%;
}

.result-summary__headline {
  margin: 0;
  font-size: clamp(1.05rem, 2.3vmin, 1.45rem);
}

.result-summary__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.45rem;
  inline-size: 100%;
}

.result-summary__item {
  display: grid;
  justify-items: center;
  gap: 0.08rem;
  padding: 0.55rem 0.35rem;
  border: 1px solid rgba(189, 112, 133, 0.24);
  border-radius: var(--radius-small);
  background: rgba(255, 255, 255, 0.7);
}

.result-summary__item span {
  color: rgba(37, 33, 36, 0.66);
  font-size: clamp(0.6rem, 1.2vmin, 0.75rem);
  font-weight: 750;
}

.result-summary__item strong {
  color: var(--color-ink);
  font-size: clamp(0.78rem, 1.65vmin, 1rem);
}

.result-summary__badge {
  margin: 0;
  padding: 0.4rem 0.75rem;
  border-radius: 999px;
  background: var(--color-pink-light);
  color: #662f40;
  font-size: 0.8rem;
  font-weight: 900;
}

@media (max-width: 34rem) {
  .result-summary__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>

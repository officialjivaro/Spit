<script setup>
import { computed } from 'vue'
import { bestTimeForDifficulty } from '../../services/statistics.js'

const props = defineProps({
  statistics: {
    type: Object,
    required: true
  },
  difficultyId: {
    type: String,
    required: true
  }
})

function formatTime(value) {
  if (!value) return '—'
  const totalSeconds = value / 1000
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = (totalSeconds % 60).toFixed(1).padStart(4, '0')
  return `${minutes}:${seconds}`
}

const standardBest = computed(() =>
  formatTime(bestTimeForDifficulty(props.statistics.standard, props.difficultyId))
)
const customBest = computed(() =>
  formatTime(bestTimeForDifficulty(props.statistics.custom, props.difficultyId))
)
const legacyBest = computed(() => formatTime(props.statistics.legacy?.bestWinMs))
</script>

<template>
  <!-- Local Stats | Separates competitive, assisted, and migrated records -->
  <section class="stats-panel" aria-label="Local statistics">
    <article>
      <span>Standard</span>
      <strong>{{ statistics.standard.wins }} wins</strong>
      <small>{{ statistics.standard.gamesPlayed }} played · {{ standardBest }} best</small>
    </article>
    <article>
      <span>Custom</span>
      <strong>{{ statistics.custom.wins }} wins</strong>
      <small>{{ statistics.custom.gamesPlayed }} played · {{ customBest }} best</small>
    </article>
    <article :class="{ 'stats-panel__legacy--empty': !statistics.legacy }">
      <span>Legacy</span>
      <strong>{{ statistics.legacy?.wins ?? 0 }} wins</strong>
      <small>{{ statistics.legacy?.gamesPlayed ?? 0 }} played · {{ legacyBest }} best</small>
    </article>
  </section>
</template>

<style scoped>
.stats-panel {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  overflow: hidden;
  border: 1px solid rgba(192, 154, 82, 0.24);
  border-radius: var(--radius-small);
  background: repeating-linear-gradient(90deg, rgba(212, 174, 103, 0.018) 0 1px, transparent 1px 0.7rem), rgba(14, 17, 14, 0.66);
}

.stats-panel article {
  min-width: 0;
  display: grid;
  gap: 0.14rem;
  padding: 0.42rem 0.48rem;
  text-align: center;
}

.stats-panel article + article {
  border-left: 1px solid rgba(192, 154, 82, 0.18);
}

.stats-panel span {
  color: var(--color-text-muted);
  font-size: clamp(0.43rem, 0.65vw, 0.54rem);
  font-weight: 850;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.stats-panel strong {
  color: var(--color-brass-bright);
  font-family: var(--font-display);
  font-size: clamp(0.58rem, 1vw, 0.78rem);
  font-variant-numeric: tabular-nums;
}

.stats-panel small {
  overflow: hidden;
  color: var(--color-text-muted);
  font-size: clamp(0.42rem, 0.62vw, 0.52rem);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.stats-panel__legacy--empty {
  opacity: 0.56;
}

@media (max-width: 480px), (max-height: 560px) {
  .stats-panel small {
    display: none;
  }
}
</style>

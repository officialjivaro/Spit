<template>
  <section class="stats-summary" aria-label="Local player statistics">
    <div class="stats-summary__item">
      <span class="stats-summary__value">{{ stats.completed }}</span>
      <span class="stats-summary__label">Completed</span>
    </div>
    <div class="stats-summary__item">
      <span class="stats-summary__value">{{ stats.currentDailyStreak }}</span>
      <span class="stats-summary__label">Daily streak</span>
    </div>
    <div class="stats-summary__item">
      <span class="stats-summary__value">{{ stats.longestDailyStreak }}</span>
      <span class="stats-summary__label">Best streak</span>
    </div>
    <div class="stats-summary__item">
      <span class="stats-summary__value">{{ bestTime }}</span>
      <span class="stats-summary__label">Best time</span>
    </div>
    <div class="stats-summary__item">
      <span class="stats-summary__value">{{ dailyStatus }}</span>
      <span class="stats-summary__label">Today</span>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { formatTime } from '../../utils/formatTime.js'

const props = defineProps({
  stats: {
    type: Object,
    required: true
  }
})

const bestTime = computed(() => {
  const values = Object.values(props.stats.personalBests || {})
  return values.length > 0 ? formatTime(Math.min(...values)) : '—'
})

const dailyStatus = computed(() => {
  if (props.stats.dailyCompletion) {
    return 'Done'
  }

  if (props.stats.dailyProgress) {
    return 'Saved'
  }

  return 'Open'
})
</script>

<style scoped>
.stats-summary {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 0.4rem;
  inline-size: 100%;
}

.stats-summary__item {
  display: grid;
  justify-items: center;
  gap: 0.08rem;
  min-inline-size: 0;
  padding: 0.45rem 0.3rem;
  border: 1px solid rgba(189, 112, 133, 0.24);
  border-radius: var(--radius-small);
  background: rgba(255, 255, 255, 0.64);
}

.stats-summary__value {
  color: var(--color-ink);
  font-size: clamp(0.82rem, 1.8vmin, 1.08rem);
  font-weight: 900;
}

.stats-summary__label {
  overflow: hidden;
  color: rgba(37, 33, 36, 0.72);
  font-size: clamp(0.58rem, 1.15vmin, 0.72rem);
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}
@media (max-width: 36rem) {
  .stats-summary {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>

<template>
  <div class="number-tracker" aria-label="Completed numbers">
    <span
      v-for="number in 9"
      :key="number"
      class="number-tracker__item"
      :class="{ 'number-tracker__item--complete': completedNumbers.includes(number) }"
      :aria-label="`Number ${number}${completedNumbers.includes(number) ? ', complete' : ''}`"
    >
      {{ number }}
      <span v-if="completedNumbers.includes(number)" class="number-tracker__mark" aria-hidden="true">×</span>
    </span>
  </div>
</template>

<script setup>
defineProps({
  completedNumbers: {
    type: Array,
    default: () => []
  }
})
</script>

<style scoped>
.number-tracker {
  display: grid;
  grid-template-columns: repeat(9, minmax(0, 1fr));
  gap: 0.25rem;
  inline-size: 100%;
}

.number-tracker__item {
  position: relative;
  display: grid;
  place-items: center;
  aspect-ratio: 1;
  min-inline-size: 0;
  overflow: hidden;
  border: 1px solid rgba(62, 57, 60, 0.48);
  border-radius: 0.35rem;
  background: rgba(255, 255, 255, 0.68);
  color: var(--color-ink);
  font-size: clamp(0.64rem, 1.35vmin, 0.8rem);
  font-weight: 850;
}

.number-tracker__item--complete {
  background: rgba(255, 211, 221, 0.94);
  color: rgba(37, 33, 36, 0.46);
}

.number-tracker__mark {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  color: var(--color-pink-shadow);
  font-size: clamp(1rem, 2.1vmin, 1.4rem);
  font-weight: 900;
}
</style>

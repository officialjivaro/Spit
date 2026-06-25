<script setup>
defineProps({
  modes: {
    type: Array,
    required: true
  },
  modelValue: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <!-- Mode Selector | Presents Quick Game, Guided Practice, and future modes -->
  <div class="mode-selector" role="radiogroup" aria-label="Game mode">
    <button
      v-for="mode in modes"
      :key="mode.id"
      class="mode-card"
      :class="{
        'mode-card--selected': modelValue === mode.id,
        'mode-card--disabled': !mode.enabled
      }"
      type="button"
      role="radio"
      :aria-checked="modelValue === mode.id"
      :disabled="!mode.enabled"
      @click="emit('update:modelValue', mode.id)"
    >
      <span class="mode-badge">{{ mode.badge }}</span>
      <strong>{{ mode.name }}</strong>
      <small>{{ mode.description }}</small>
    </button>
  </div>
</template>

<style scoped>
.mode-selector {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: clamp(0.3rem, 0.8vw, 0.6rem);
}

.mode-card {
  position: relative;
  min-width: 0;
  min-height: 5.8rem;
  display: grid;
  align-content: start;
  gap: 0.28rem;
  padding: clamp(0.52rem, 1.1vw, 0.82rem);
  overflow: hidden;
  border: 1px solid rgba(194, 156, 83, 0.26);
  border-radius: var(--radius-medium);
  color: var(--color-text);
  text-align: left;
  background:
    repeating-linear-gradient(90deg, rgba(214, 176, 104, 0.02) 0 1px, transparent 1px 0.7rem),
    linear-gradient(145deg, rgba(66, 62, 49, 0.86), rgba(16, 19, 16, 0.96));
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.28), 0 1px 0 rgba(255, 230, 181, 0.04) inset;
  cursor: pointer;
  transition: transform var(--transition-fast), border-color var(--transition-fast), box-shadow var(--transition-fast), opacity var(--transition-fast);
}

.mode-card::after {
  content: '';
  position: absolute;
  right: -1.5rem;
  bottom: -1.5rem;
  width: 3.4rem;
  aspect-ratio: 1;
  border: 1px solid rgba(167, 66, 53, 0.22);
  transform: rotate(45deg);
}

.mode-card:hover:not(:disabled) {
  border-color: var(--color-brass-bright);
  transform: translateY(-2px);
}

.mode-card--selected {
  border-color: var(--color-accent-bright);
  box-shadow: 0 0 0 0.12rem rgba(166, 64, 52, 0.17), var(--shadow-accent);
}

.mode-card--selected:nth-child(2) {
  border-color: var(--color-secondary-bright);
  box-shadow: 0 0 0 0.12rem rgba(61, 117, 111, 0.17), var(--shadow-secondary);
}

.mode-card--disabled {
  opacity: 0.42;
  cursor: not-allowed;
}

.mode-badge {
  width: max-content;
  padding: 0.16rem 0.38rem;
  border: 1px solid rgba(196, 158, 87, 0.32);
  border-radius: var(--radius-small);
  color: var(--color-secondary-bright);
  font-size: clamp(0.42rem, 0.65vw, 0.54rem);
  font-weight: 850;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  background: rgba(14, 18, 15, 0.66);
}

.mode-card--selected .mode-badge {
  color: var(--color-parchment);
  border-color: rgba(212, 107, 82, 0.55);
  background: rgba(92, 35, 29, 0.42);
}

.mode-card--selected:nth-child(2) .mode-badge {
  border-color: rgba(134, 188, 177, 0.55);
  background: rgba(28, 67, 62, 0.42);
}

.mode-card strong {
  color: var(--color-parchment);
  font-family: var(--font-display);
  font-size: clamp(0.68rem, 1.2vw, 0.94rem);
  letter-spacing: 0.035em;
  text-transform: uppercase;
}

.mode-card small {
  color: var(--color-text-muted);
  font-size: clamp(0.5rem, 0.74vw, 0.64rem);
  line-height: 1.3;
}

@media (max-width: 520px), (max-height: 600px) {
  .mode-card {
    min-height: 4.2rem;
    padding: 0.46rem;
  }

  .mode-card small {
    display: none;
  }
}

@media (max-height: 420px) {
  .mode-card { min-height: 3.25rem; padding: 0.34rem 0.42rem; gap: 0.16rem; }
  .mode-badge { padding-block: 0.1rem; }
}
</style>

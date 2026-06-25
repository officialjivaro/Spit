<template>
  <div class="number-pad" aria-label="Number pad">
    <button
      v-for="number in 9"
      :key="number"
      class="number-pad__button"
      :class="{ 'number-pad__button--complete': completedNumbers.includes(number) }"
      type="button"
      :aria-label="`Enter number ${number}`"
      :disabled="disabled"
      data-game-control
      @click="emit('select', number)"
    >
      {{ number }}
    </button>
  </div>
</template>

<script setup>
defineProps({
  completedNumbers: {
    type: Array,
    default: () => []
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['select'])
</script>

<style scoped>
.number-pad {
  display: grid;
  grid-template-columns: repeat(9, minmax(0, 1fr));
  gap: clamp(0.18rem, 0.55vmin, 0.4rem);
  inline-size: 100%;
}

.number-pad__button {
  display: grid;
  place-items: center;
  aspect-ratio: 1;
  min-inline-size: 0;
  padding: 0;
  border: 2px solid var(--sudoku-control-border);
  border-radius: clamp(0.28rem, 0.7vmin, 0.5rem);
  background: var(--sudoku-control-background);
  color: var(--color-ink);
  box-shadow: 0 0.18rem 0 var(--sudoku-control-shadow);
  cursor: pointer;
  font-size: clamp(0.9rem, 2.25vmin, 1.35rem);
  font-weight: 900;
  transition: transform 120ms ease, background 120ms ease, opacity 120ms ease;
}

.number-pad__button:hover:not(:disabled) {
  background: var(--sudoku-control-active);
  transform: translateY(-0.08rem);
}

.number-pad__button:active:not(:disabled) {
  transform: translateY(0.08rem);
}

.number-pad__button:focus-visible {
  outline: 3px solid var(--color-pink-border);
  outline-offset: 2px;
}

.number-pad__button--complete {
  opacity: 0.38;
  text-decoration: line-through;
}

.number-pad__button:disabled {
  cursor: default;
  opacity: 0.5;
}
</style>

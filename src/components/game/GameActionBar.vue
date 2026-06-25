<template>
  <div class="action-bar" aria-label="Game actions">
    <button
      class="action-bar__button"
      :class="{ 'action-bar__button--active': notesMode }"
      type="button"
      :aria-pressed="notesMode"
      :disabled="disabled"
      data-game-control
      @click="emit('toggle-notes')"
    >
      Notes
    </button>
    <button class="action-bar__button" type="button" :disabled="disabled" data-game-control @click="emit('erase')">
      Erase
    </button>
    <button class="action-bar__button" type="button" :disabled="disabled || !canUndo" data-game-control @click="emit('undo')">
      Undo
    </button>
    <button class="action-bar__button" type="button" :disabled="disabled || !canRedo" data-game-control @click="emit('redo')">
      Redo
    </button>
    <button class="action-bar__button" type="button" :disabled="disabled || hintsRemaining <= 0" data-game-control @click="emit('hint')">
      Hint {{ hintsRemaining }}
    </button>
  </div>
</template>

<script setup>
defineProps({
  notesMode: {
    type: Boolean,
    default: false
  },
  canUndo: {
    type: Boolean,
    default: false
  },
  canRedo: {
    type: Boolean,
    default: false
  },
  hintsRemaining: {
    type: Number,
    default: 0
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['toggle-notes', 'erase', 'undo', 'redo', 'hint'])
</script>

<style scoped>
.action-bar {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 0.35rem;
  inline-size: 100%;
}

.action-bar__button {
  min-inline-size: 0;
  padding: 0.55rem 0.35rem;
  border: 1px solid var(--sudoku-control-border);
  border-radius: var(--radius-small);
  background: var(--sudoku-control-background);
  color: var(--color-ink);
  cursor: pointer;
  font-size: clamp(0.68rem, 1.45vmin, 0.86rem);
  font-weight: 800;
  transition: background 130ms ease, transform 130ms ease;
}

.action-bar__button:hover:not(:disabled) {
  background: var(--sudoku-control-active);
  transform: translateY(-0.06rem);
}

.action-bar__button--active {
  border-color: var(--color-pink-border);
  background: var(--sudoku-control-active);
  box-shadow: inset 0 0 0 2px rgba(255, 255, 255, 0.68);
}

.action-bar__button:focus-visible {
  outline: 3px solid var(--color-pink-border);
  outline-offset: 2px;
}

.action-bar__button:disabled {
  cursor: default;
  opacity: 0.42;
}
</style>

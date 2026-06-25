<template>
  <aside class="control-panel glass-panel" aria-label="Sudoku controls">
    <NumberPad
      :completed-numbers="completedNumbers"
      :disabled="disabled"
      @select="emit('digit', $event)"
    />

    <GameActionBar
      :notes-mode="notesMode"
      :can-undo="canUndo"
      :can-redo="canRedo"
      :hints-remaining="hintsRemaining"
      :disabled="disabled"
      @toggle-notes="emit('toggle-notes')"
      @erase="emit('erase')"
      @undo="emit('undo')"
      @redo="emit('redo')"
      @hint="emit('hint')"
    />

    <NumberTracker :completed-numbers="completedNumbers" />

    <div class="control-panel__footer">
      <ToggleSwitch
        :model-value="highlightEditable"
        label="Highlight Empty Slots"
        :disabled="disabled"
        @update:model-value="emit('update:highlightEditable', $event)"
      />
      <AppButton size="small" variant="secondary" @click="emit('home')">Return Home</AppButton>
    </div>
  </aside>
</template>

<script setup>
import NumberTracker from './NumberTracker.vue'
import NumberPad from './NumberPad.vue'
import GameActionBar from './GameActionBar.vue'
import AppButton from '../ui/AppButton.vue'
import ToggleSwitch from '../ui/ToggleSwitch.vue'

defineProps({
  completedNumbers: {
    type: Array,
    default: () => []
  },
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
  highlightEditable: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'digit',
  'toggle-notes',
  'erase',
  'undo',
  'redo',
  'hint',
  'home',
  'update:highlightEditable'
])
</script>

<style scoped>
.control-panel {
  display: grid;
  align-content: center;
  gap: clamp(0.55rem, 1.1dvh, 0.9rem);
  inline-size: 100%;
  min-inline-size: 0;
  padding: clamp(0.7rem, 1.6vmin, 1.1rem);
}

.control-panel__footer {
  display: grid;
  justify-items: center;
  gap: 0.55rem;
}

@media (max-width: 54rem) {
  .control-panel {
    gap: 0.45rem;
    padding: 0.6rem;
  }

  .control-panel__footer {
    grid-template-columns: 1fr auto;
    align-items: center;
    justify-items: stretch;
  }
}
</style>

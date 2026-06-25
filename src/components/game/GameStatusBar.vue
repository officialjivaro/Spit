<template>
  <div class="status-bar" aria-label="Game status">
    <span class="status-chip status-chip--strong">{{ modeLabel }}</span>
    <span class="status-chip">{{ difficultyLabel }}</span>
    <GameTimer
      v-if="showTimer"
      :timer-type="timerType"
      :started-at="startedAt"
      :deadline="deadline"
      @expired="emit('expired')"
    />
    <span v-if="showMistakes" class="status-chip">Mistakes {{ mistakes }}</span>
    <span class="status-chip">Hints {{ hintsRemaining }}</span>
  </div>
</template>

<script setup>
import GameTimer from './GameTimer.vue'

defineProps({
  modeLabel: {
    type: String,
    required: true
  },
  difficultyLabel: {
    type: String,
    required: true
  },
  timerType: {
    type: String,
    default: 'elapsed'
  },
  showTimer: {
    type: Boolean,
    default: true
  },
  showMistakes: {
    type: Boolean,
    default: true
  },
  startedAt: {
    type: Number,
    default: null
  },
  deadline: {
    type: Number,
    default: null
  },
  mistakes: {
    type: Number,
    default: 0
  },
  hintsRemaining: {
    type: Number,
    default: 3
  }
})

const emit = defineEmits(['expired'])
</script>

<style scoped>
.status-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  inline-size: 100%;
}

.status-chip {
  display: inline-flex;
  align-items: center;
  min-block-size: 2rem;
  padding: 0.35rem 0.65rem;
  border: 1px solid rgba(255, 255, 255, 0.68);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.72);
  color: var(--color-ink);
  box-shadow: 0 0.2rem 0.65rem rgba(44, 33, 38, 0.12);
  font-size: clamp(0.68rem, 1.55vmin, 0.88rem);
  font-weight: 850;
  white-space: nowrap;
}

.status-chip--strong {
  border-color: rgba(189, 112, 133, 0.58);
  background: rgba(255, 218, 228, 0.9);
}
</style>

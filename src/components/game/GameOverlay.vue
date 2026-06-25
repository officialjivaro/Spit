<script setup>
import { computed } from 'vue'
import AppButton from '../common/AppButton.vue'

const props = defineProps({
  kind: {
    type: String,
    required: true
  },
  countdown: {
    type: Number,
    default: 3
  },
  stallStage: {
    type: [String, Number],
    default: null
  }
})

defineEmits(['resume'])

const stallText = computed(() => {
  if (props.stallStage === 'warning') return 'NO MOVES'
  if (props.stallStage === '1' || props.stallStage === '2') return props.stallStage
  return 'REVEAL'
})

const overlayLabel = computed(() => {
  if (props.kind === 'stall') return `No moves. Reserve sequence ${stallText.value}.`
  if (props.kind === 'countdown') return `Game begins in ${props.countdown > 0 ? props.countdown : 'go'}.`
  if (props.kind === 'viewport') return 'The game area is too small.'
  if (props.kind === 'focus') return 'The game is paused because focus was lost.'
  return 'The game is paused.'
})
</script>

<template>
  <!-- Game Overlay | Covers countdown, deadlocks, pause, focus, and viewport interruptions -->
  <div
    class="game-overlay"
    :class="`game-overlay--${kind}`"
    :role="kind === 'stall' ? 'status' : 'dialog'"
    :aria-modal="kind === 'stall' ? undefined : true"
    :aria-label="overlayLabel"
  >
    <div v-if="kind === 'countdown'" :key="countdown" class="countdown-number">
      {{ countdown > 0 ? countdown : 'GO!' }}
    </div>

    <div v-else-if="kind === 'stall'" :key="stallStage" class="stall-sequence">
      <span>Reserve synchronization</span>
      <strong>{{ stallText }}</strong>
      <small>
        {{ stallStage === 'reveal' ? 'Both reserves feed the center' : 'Stand by' }}
      </small>
    </div>

    <div v-else class="overlay-panel">
      <span class="overlay-kicker">
        {{ kind === 'viewport' ? 'More room needed' : kind === 'focus' ? 'Game paused' : 'Paused' }}
      </span>
      <h2>
        {{
          kind === 'viewport'
            ? 'Rotate or enlarge the game'
            : kind === 'focus'
              ? 'Tap or click to continue'
              : 'Catch your breath'
        }}
      </h2>
      <p v-if="kind === 'viewport'">
        Use portrait on a phone or enlarge this iframe. The table will not add page scrollbars.
      </p>
      <p v-else>The computer and all pending actions are stopped while you are away.</p>
      <AppButton v-if="kind !== 'viewport'" size="large" @click="$emit('resume')">
        Resume Game
      </AppButton>
    </div>
  </div>
</template>

<style scoped>
.game-overlay {
  position: absolute;
  z-index: var(--z-overlay);
  inset: 0;
  display: grid;
  place-items: center;
  padding: var(--space-4);
  background: rgba(7, 9, 7, 0.78);
  backdrop-filter: blur(7px);
}

.game-overlay--stall {
  background: rgba(20, 10, 8, 0.54);
  backdrop-filter: blur(3px);
  pointer-events: none;
}

.countdown-number {
  color: var(--color-accent-bright);
  font-family: var(--font-display);
  font-size: clamp(4rem, 16vw, 9rem);
  font-weight: 900;
  line-height: 1;
  text-shadow: 0 0 2.1rem rgba(166, 64, 52, 0.58), 0 0 4rem rgba(207, 174, 107, 0.2);
  animation: countdown-pop 430ms ease both;
}

.stall-sequence {
  position: relative;
  min-width: min(23rem, 88vw);
  display: grid;
  justify-items: center;
  gap: 0.2rem;
  padding: clamp(1rem, 4vw, 1.8rem);
  border: 1px solid rgba(212, 75, 63, 0.72);
  border-inline-width: 3px;
  color: var(--color-parchment);
  text-align: center;
  background:
    repeating-linear-gradient(135deg, rgba(211, 75, 63, 0.08) 0 0.5rem, transparent 0.5rem 1rem),
    rgba(23, 15, 12, 0.94);
  box-shadow: 0 0 2rem rgba(211, 75, 63, 0.28), 0 18px 40px rgba(0, 0, 0, 0.55);
  animation: stall-warning 520ms ease both;
}

.stall-sequence span,
.stall-sequence small {
  color: var(--color-brass-bright);
  font-size: 0.58rem;
  font-weight: 850;
  letter-spacing: 0.15em;
  text-transform: uppercase;
}

.stall-sequence strong {
  font-family: var(--font-display);
  font-size: clamp(2.8rem, 12vw, 6.5rem);
  line-height: 1;
  letter-spacing: 0.04em;
  text-shadow: 0 0 1.8rem rgba(212, 75, 63, 0.54);
  animation: countdown-pop 430ms ease both;
}

.overlay-panel {
  position: relative;
  width: min(28rem, 100%);
  padding: clamp(1.1rem, 4vw, 2rem);
  overflow: hidden;
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-large);
  text-align: center;
  background: repeating-linear-gradient(90deg, rgba(219, 181, 109, 0.024) 0 1px, transparent 1px 0.72rem), linear-gradient(145deg, rgba(58, 54, 43, 0.98), rgba(14, 16, 13, 0.99));
  box-shadow: var(--shadow-panel), var(--shadow-brass);
  animation: result-rise var(--transition-medium) both;
}

.overlay-panel::before,
.overlay-panel::after {
  content: '';
  position: absolute;
  width: 2.2rem;
  height: 2.2rem;
  border-color: var(--color-accent);
  opacity: 0.55;
}
.overlay-panel::before { left: 0.55rem; top: 0.55rem; border-left: 2px solid; border-top: 2px solid; }
.overlay-panel::after { right: 0.55rem; bottom: 0.55rem; border-right: 2px solid; border-bottom: 2px solid; }

.overlay-kicker {
  color: var(--color-secondary-bright);
  font-size: 0.66rem;
  font-weight: 850;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.overlay-panel h2 {
  margin: 0.42rem 0 0.6rem;
  color: var(--color-parchment);
  font-family: var(--font-display);
  font-size: clamp(1.25rem, 4vw, 2.15rem);
  text-transform: uppercase;
}

.overlay-panel p {
  margin-bottom: 1.05rem;
  color: var(--color-text-muted);
  line-height: 1.45;
}
</style>

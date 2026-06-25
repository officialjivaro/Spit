<script setup>
import { computed } from 'vue'

const props = defineProps({
  stage: {
    type: String,
    required: true
  },
  targetSlot: {
    type: Number,
    default: null
  }
})

const guide = computed(() => {
  if (props.stage === 'select') {
    return {
      step: 'Step 1 of 3',
      title: 'Select a glowing card',
      detail: 'Press its number or tap the card.'
    }
  }
  if (props.stage === 'play') {
    return {
      step: 'Step 2 of 3',
      title: 'Choose a glowing center pile',
      detail: 'Use an arrow key or tap the destination.'
    }
  }
  if (props.stage === 'refill') {
    return {
      step: 'Step 3 of 3',
      title: `Refill slot ${(props.targetSlot ?? 0) + 1}`,
      detail: 'Press the slot number or tap the empty frame.'
    }
  }
  return {
    step: 'Training complete',
    title: 'Free practice',
    detail: 'The slow opponent is now active.'
  }
})
</script>

<template>
  <!-- Practice Guide | Teaches the custom controls without blocking the board -->
  <aside class="practice-guide" :class="{ 'practice-guide--complete': stage === 'free' }" aria-live="polite">
    <span>{{ guide.step }}</span>
    <strong>{{ guide.title }}</strong>
    <small>{{ guide.detail }}</small>
  </aside>
</template>

<style scoped>
.practice-guide {
  position: absolute;
  z-index: 12;
  right: clamp(0.65rem, 1.6vw, 1.25rem);
  bottom: clamp(0.65rem, 1.6vw, 1.15rem);
  width: min(17rem, calc(100% - 1.3rem));
  display: grid;
  gap: 0.16rem;
  padding: 0.62rem 0.74rem;
  border: 1px solid rgba(134, 188, 177, 0.58);
  border-left: 3px solid var(--color-secondary-bright);
  border-radius: var(--radius-small);
  background: rgba(13, 18, 16, 0.92);
  box-shadow: 0 12px 26px rgba(0, 0, 0, 0.44), var(--shadow-secondary);
  pointer-events: none;
}

.practice-guide span {
  color: var(--color-secondary-bright);
  font-size: 0.5rem;
  font-weight: 850;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.practice-guide strong {
  color: var(--color-parchment);
  font-family: var(--font-display);
  font-size: 0.78rem;
  text-transform: uppercase;
}

.practice-guide small {
  color: var(--color-text-muted);
  font-size: 0.58rem;
  line-height: 1.35;
}

.practice-guide--complete {
  border-color: rgba(141, 167, 103, 0.54);
  border-left-color: var(--color-success);
  animation: guide-complete 2.8s ease both;
}

@media (max-width: 600px), (max-height: 450px) {
  .practice-guide {
    right: 0.4rem;
    bottom: 0.4rem;
    width: min(14rem, calc(100% - 0.8rem));
    padding: 0.42rem 0.55rem;
  }

  .practice-guide small {
    display: none;
  }
}
</style>

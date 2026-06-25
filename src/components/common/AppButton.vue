<script setup>
defineProps({
  variant: {
    type: String,
    default: 'primary'
  },
  size: {
    type: String,
    default: 'medium'
  },
  block: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    default: 'button'
  }
})

defineEmits(['click'])
</script>

<template>
  <!-- Shared Button | Provides consistent primary and secondary actions -->
  <button
    class="app-button"
    :class="[`app-button--${variant}`, `app-button--${size}`, { 'app-button--block': block }]"
    :type="type"
    :disabled="disabled"
    @click="$emit('click', $event)"
  >
    <slot />
  </button>
</template>

<style scoped>
.app-button {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  min-height: 2.6rem;
  padding: 0.62rem 1rem;
  overflow: hidden;
  border: 1px solid transparent;
  border-radius: var(--radius-small);
  color: var(--color-text);
  font-weight: 850;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  cursor: pointer;
  transition:
    transform var(--transition-fast),
    border-color var(--transition-fast),
    box-shadow var(--transition-fast),
    opacity var(--transition-fast);
}

.app-button::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(110deg, transparent 0 42%, rgba(255, 237, 194, 0.12) 49%, transparent 56%);
  transform: translateX(-110%);
  transition: transform 380ms ease;
}

.app-button:hover:not(:disabled) {
  transform: translateY(-2px);
}

.app-button:hover:not(:disabled)::after {
  transform: translateX(110%);
}

.app-button:active:not(:disabled) {
  transform: translateY(0);
}

.app-button:disabled {
  opacity: 0.48;
  cursor: not-allowed;
}

.app-button--primary {
  color: #1b1510;
  border-color: var(--color-brass-bright);
  background:
    linear-gradient(180deg, rgba(255, 225, 166, 0.12), transparent 38%),
    linear-gradient(135deg, var(--color-accent-bright), var(--color-accent));
  box-shadow:
    0 10px 24px rgba(125, 43, 34, 0.32),
    0 1px 0 rgba(255, 236, 197, 0.32) inset;
}

.app-button--primary:hover:not(:disabled) {
  border-color: var(--color-parchment);
  box-shadow:
    0 14px 30px rgba(142, 48, 37, 0.42),
    var(--shadow-brass);
}

.app-button--secondary {
  border-color: var(--color-border);
  background:
    linear-gradient(180deg, rgba(82, 77, 62, 0.94), rgba(31, 31, 25, 0.98));
  box-shadow:
    0 9px 20px rgba(0, 0, 0, 0.34),
    0 1px 0 rgba(255, 233, 187, 0.06) inset;
}

.app-button--secondary:hover:not(:disabled) {
  border-color: var(--color-brass-bright);
  box-shadow: 0 11px 24px rgba(0, 0, 0, 0.42), var(--shadow-brass);
}

.app-button--ghost {
  border-color: rgba(192, 155, 84, 0.28);
  background: rgba(16, 18, 15, 0.62);
}

.app-button--small {
  min-height: 2.15rem;
  padding: 0.42rem 0.72rem;
  font-size: 0.72rem;
}

.app-button--large {
  min-height: 3.15rem;
  padding: 0.82rem 1.2rem;
  font-size: clamp(0.78rem, 1.4vw, 1rem);
}

.app-button--block {
  width: 100%;
}
</style>

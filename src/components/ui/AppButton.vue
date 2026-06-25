<template>
  <button
    class="app-button text-effect"
    :class="[`app-button--${size}`, `app-button--${variant}`]"
    :type="type"
    :disabled="disabled"
  >
    <slot />
  </button>
</template>

<script setup>
defineProps({
  type: {
    type: String,
    default: 'button'
  },
  size: {
    type: String,
    default: 'medium',
    validator: value => ['small', 'medium', 'large'].includes(value)
  },
  variant: {
    type: String,
    default: 'primary',
    validator: value => ['primary', 'secondary', 'quiet'].includes(value)
  },
  disabled: {
    type: Boolean,
    default: false
  }
})
</script>

<style scoped>
.app-button {
  display: inline-grid;
  place-items: center;
  min-inline-size: 8.5rem;
  border: 2px solid var(--color-pink-border);
  border-radius: var(--radius-medium);
  cursor: pointer;
  font-family: inherit;
  line-height: 1;
  transition: transform 160ms ease, box-shadow 160ms ease, filter 160ms ease, background 160ms ease;
}

.app-button--primary {
  background: linear-gradient(145deg, var(--color-pink-light), var(--color-pink));
  box-shadow: 0 0.3rem 0 var(--color-pink-shadow), var(--shadow-soft);
}

.app-button--secondary {
  background: linear-gradient(145deg, #fff8fa, #f2d9e0);
  box-shadow: 0 0.24rem 0 #aa7b88, var(--shadow-soft);
}

.app-button--quiet {
  border-color: rgba(68, 59, 63, 0.42);
  background: rgba(48, 44, 47, 0.82);
  box-shadow: 0 0.22rem 0 rgba(21, 19, 20, 0.78), var(--shadow-soft);
}

.app-button--small {
  min-inline-size: 7rem;
  padding: 0.65rem 1rem;
  font-size: 0.95rem;
}

.app-button--medium {
  padding: 0.85rem 1.5rem;
  font-size: 1.1rem;
}

.app-button--large {
  min-inline-size: 10rem;
  padding: 1rem 1.75rem;
  font-size: 1.35rem;
}

.app-button:hover:not(:disabled) {
  filter: brightness(1.04);
  transform: translateY(-0.15rem);
}

.app-button--primary:hover:not(:disabled) {
  box-shadow: 0 0.45rem 0 var(--color-pink-shadow), var(--shadow-strong);
}

.app-button--secondary:hover:not(:disabled) {
  box-shadow: 0 0.4rem 0 #aa7b88, var(--shadow-strong);
}

.app-button--quiet:hover:not(:disabled) {
  background: rgba(31, 29, 30, 0.92);
  box-shadow: 0 0.36rem 0 rgba(21, 19, 20, 0.82), var(--shadow-strong);
}

.app-button:active:not(:disabled) {
  transform: translateY(0.15rem);
  box-shadow: 0 0.1rem 0 var(--color-pink-shadow), var(--shadow-soft);
}

.app-button:focus-visible {
  outline: 3px solid rgba(255, 255, 255, 0.95);
  outline-offset: 3px;
}

.app-button:disabled {
  cursor: wait;
  filter: grayscale(0.4);
  opacity: 0.65;
}
</style>

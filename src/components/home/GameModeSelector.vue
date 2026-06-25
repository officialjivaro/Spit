<template>
  <fieldset class="mode-selector">
    <legend class="mode-selector__legend text-effect">Choose a mode</legend>
    <div class="mode-selector__grid">
      <label
        v-for="mode in modes"
        :key="mode.key"
        class="mode-card"
        :class="{ 'mode-card--selected': modelValue === mode.key }"
      >
        <input
          class="mode-card__input"
          type="radio"
          name="game-mode"
          :value="mode.key"
          :checked="modelValue === mode.key"
          @change="emit('update:modelValue', mode.key)"
        />
        <span class="mode-card__title">{{ mode.label }}</span>
        <span class="mode-card__description">{{ mode.description }}</span>
      </label>
    </div>
  </fieldset>
</template>

<script setup>
import { GAME_MODE_OPTIONS } from '../../constants/gameModes.js'

defineProps({
  modelValue: {
    type: String,
    default: 'classic'
  }
})

const emit = defineEmits(['update:modelValue'])
const modes = GAME_MODE_OPTIONS
</script>

<style scoped>
.mode-selector {
  display: grid;
  gap: 0.55rem;
  inline-size: 100%;
  margin: 0;
  padding: 0;
  border: 0;
}

.mode-selector__legend {
  margin: 0 auto 0.25rem;
  font-size: clamp(0.95rem, 1.9vmin, 1.2rem);
  text-align: center;
}

.mode-selector__grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: clamp(0.35rem, 1vmin, 0.65rem);
}

.mode-card {
  position: relative;
  display: grid;
  align-content: center;
  gap: 0.25rem;
  min-block-size: 5.8rem;
  padding: 0.7rem;
  border: 1px solid rgba(65, 54, 59, 0.2);
  border-radius: var(--radius-medium);
  background: rgba(255, 252, 253, 0.72);
  box-shadow: 0 0.25rem 0.8rem rgba(48, 35, 41, 0.12);
  cursor: pointer;
  text-align: center;
  transition: transform 160ms ease, border-color 160ms ease, background 160ms ease, box-shadow 160ms ease;
}

.mode-card:hover {
  transform: translateY(-0.12rem);
  border-color: rgba(189, 112, 133, 0.58);
  background: rgba(255, 244, 248, 0.92);
}

.mode-card--selected {
  border-color: var(--color-pink-border);
  background: rgba(255, 225, 233, 0.95);
  box-shadow: inset 0 0 0 2px rgba(255, 255, 255, 0.65), 0 0.35rem 1rem rgba(150, 81, 102, 0.2);
}

.mode-card__input {
  position: absolute;
  inline-size: 1px;
  block-size: 1px;
  opacity: 0;
}

.mode-card__input:focus-visible + .mode-card__title {
  outline: 3px solid rgba(189, 112, 133, 0.7);
  outline-offset: 3px;
}

.mode-card__title {
  color: var(--color-ink);
  font-size: clamp(0.8rem, 1.65vmin, 1rem);
  font-weight: 900;
}

.mode-card__description {
  color: rgba(37, 33, 36, 0.76);
  font-size: clamp(0.64rem, 1.3vmin, 0.78rem);
  font-weight: 650;
  line-height: 1.25;
}

@media (max-width: 44rem) {
  .mode-selector__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .mode-card {
    min-block-size: 4.7rem;
    padding: 0.5rem;
  }
}

@media (max-height: 39rem) {
  .mode-card {
    min-block-size: 4.2rem;
    padding-block: 0.4rem;
  }

  .mode-card__description {
    display: none;
  }
}
</style>

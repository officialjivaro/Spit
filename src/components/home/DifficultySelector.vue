<template>
  <div class="difficulty-selector">
    <label class="difficulty-selector__label text-effect" for="difficulty">
      Select difficulty
    </label>
    <select
      id="difficulty"
      class="difficulty-selector__select"
      :value="modelValue"
      @change="emit('update:modelValue', $event.target.value)"
    >
      <option v-for="option in options" :key="option.key" :value="option.key">
        {{ option.label }}
      </option>
    </select>
    <p class="difficulty-selector__description">{{ selectedDescription }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { DIFFICULTIES, DIFFICULTY_OPTIONS } from '../../constants/difficulties.js'

const props = defineProps({
  modelValue: {
    type: String,
    default: 'easy'
  }
})

const emit = defineEmits(['update:modelValue'])
const options = DIFFICULTY_OPTIONS
const selectedDescription = computed(() => DIFFICULTIES[props.modelValue]?.description || DIFFICULTIES.easy.description)
</script>

<style scoped>
.difficulty-selector {
  display: grid;
  justify-items: center;
  gap: 0.5rem;
}

.difficulty-selector__label {
  font-size: clamp(1.05rem, 2.3vmin, 1.4rem);
}

.difficulty-selector__select {
  min-inline-size: 11rem;
  padding: 0.65rem 2.25rem 0.65rem 0.9rem;
  border: 2px solid rgba(181, 106, 127, 0.75);
  border-radius: var(--radius-small);
  background: rgba(255, 248, 250, 0.94);
  color: var(--color-ink);
  font: inherit;
  font-size: 1rem;
  font-weight: 700;
  box-shadow: var(--shadow-soft);
  cursor: pointer;
}

.difficulty-selector__select:focus-visible {
  outline: 3px solid rgba(255, 255, 255, 0.95);
  outline-offset: 3px;
}

.difficulty-selector__description {
  max-inline-size: 24rem;
  margin: 0;
  color: rgba(37, 33, 36, 0.82);
  font-size: clamp(0.78rem, 1.65vmin, 0.95rem);
  font-weight: 700;
  text-align: center;
  text-shadow: 0 1px 1px rgba(255, 255, 255, 0.9);
}
</style>

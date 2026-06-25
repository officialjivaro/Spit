<script setup>
defineProps({
  difficulties: {
    type: Array,
    required: true
  },
  modelValue: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <!-- Difficulty Selector | Changes only the computer's reaction timing -->
  <fieldset class="difficulty-selector">
    <legend>Opponent speed</legend>
    <div class="difficulty-options">
      <label
        v-for="difficulty in difficulties"
        :key="difficulty.id"
        class="difficulty-option"
        :class="{ 'difficulty-option--selected': modelValue === difficulty.id }"
      >
        <input
          type="radio"
          name="difficulty"
          :value="difficulty.id"
          :checked="modelValue === difficulty.id"
          @change="emit('update:modelValue', difficulty.id)"
        />
        <strong>{{ difficulty.name }}</strong>
        <small>{{ difficulty.description }}</small>
      </label>
    </div>
  </fieldset>
</template>

<style scoped>
.difficulty-selector {
  min-width: 0;
  margin: 0;
  padding: 0;
  border: 0;
}

.difficulty-selector legend {
  margin-bottom: 0.45rem;
  color: var(--color-text-muted);
  font-size: 0.62rem;
  font-weight: 850;
  letter-spacing: 0.13em;
  text-transform: uppercase;
}

.difficulty-options {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.42rem;
}

.difficulty-option {
  position: relative;
  min-width: 0;
  display: grid;
  gap: 0.22rem;
  padding: 0.62rem;
  border: 1px solid rgba(192, 154, 82, 0.24);
  border-radius: var(--radius-small);
  background:
    linear-gradient(180deg, rgba(61, 58, 47, 0.56), rgba(14, 17, 14, 0.72));
  cursor: pointer;
  transition:
    border-color var(--transition-fast),
    transform var(--transition-fast),
    box-shadow var(--transition-fast);
}

.difficulty-option::before {
  content: '';
  position: absolute;
  right: 0.48rem;
  top: 0.48rem;
  width: 0.42rem;
  aspect-ratio: 1;
  border: 1px solid rgba(207, 173, 105, 0.34);
  border-radius: 50%;
  background: #23231d;
}

.difficulty-option:hover {
  transform: translateY(-1px);
  border-color: var(--color-brass);
}

.difficulty-option--selected {
  border-color: var(--color-secondary-bright);
  box-shadow:
    0 0 0 0.1rem rgba(61, 117, 111, 0.18),
    var(--shadow-secondary);
}

.difficulty-option:focus-within {
  outline: 3px solid var(--color-brass-bright);
  outline-offset: 2px;
}

.difficulty-option--selected::before {
  background: var(--color-success);
  box-shadow: 0 0 0.55rem rgba(141, 167, 103, 0.58);
}

.difficulty-option input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.difficulty-option strong {
  color: var(--color-parchment);
  font-family: var(--font-display);
  font-size: clamp(0.64rem, 1.05vw, 0.8rem);
  text-transform: uppercase;
}

.difficulty-option small {
  color: var(--color-text-muted);
  font-size: clamp(0.5rem, 0.75vw, 0.61rem);
  line-height: 1.35;
}

@media (max-height: 650px) {
  .difficulty-option small {
    display: none;
  }
}

@media (max-width: 500px), (max-height: 620px) {
  .difficulty-option {
    padding: 0.42rem;
  }

  .difficulty-option small {
    display: none;
  }
}

@media (max-height: 420px) {
  .difficulty-selector legend { margin-bottom: 0.22rem; }
  .difficulty-option { padding: 0.3rem 0.38rem; }
}

</style>

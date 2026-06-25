<template>
  <label class="toggle-switch" :for="inputId">
    <span class="toggle-switch__label text-effect">{{ label }}</span>
    <span class="toggle-switch__control">
      <input
        :id="inputId"
        class="toggle-switch__input"
        type="checkbox"
        :checked="modelValue"
        :disabled="disabled"
        @change="handleChange"
      />
      <span class="toggle-switch__track" aria-hidden="true">
        <span class="toggle-switch__thumb"></span>
      </span>
    </span>
  </label>
</template>

<script setup>
import { useId } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  label: {
    type: String,
    required: true
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])
const inputId = `toggle-${useId()}`

function handleChange(event) {
  emit('update:modelValue', event.target.checked)
}
</script>

<style scoped>
.toggle-switch {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  cursor: pointer;
  user-select: none;
}

.toggle-switch__label {
  font-size: clamp(1rem, 2.1vmin, 1.3rem);
}

.toggle-switch__control {
  position: relative;
  display: inline-block;
  inline-size: 3rem;
  block-size: 1.55rem;
  flex: 0 0 auto;
}

.toggle-switch__input {
  position: absolute;
  inline-size: 1px;
  block-size: 1px;
  opacity: 0;
}

.toggle-switch__track {
  position: absolute;
  inset: 0;
  border: 2px solid rgba(19, 18, 19, 0.78);
  border-radius: 999px;
  background: rgba(61, 58, 61, 0.9);
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.35);
  transition: background 180ms ease, border-color 180ms ease;
}

.toggle-switch__thumb {
  position: absolute;
  inset-block-start: 50%;
  inset-inline-start: 0.16rem;
  inline-size: 1.12rem;
  block-size: 1.12rem;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.35);
  transform: translateY(-50%);
  transition: transform 180ms ease;
}

.toggle-switch__input:checked + .toggle-switch__track {
  border-color: var(--color-pink-shadow);
  background: var(--color-pink);
}

.toggle-switch__input:checked + .toggle-switch__track .toggle-switch__thumb {
  transform: translate(1.42rem, -50%);
}

.toggle-switch__input:focus-visible + .toggle-switch__track {
  outline: 3px solid rgba(255, 255, 255, 0.95);
  outline-offset: 3px;
}

.toggle-switch__input:disabled + .toggle-switch__track {
  opacity: 0.55;
}
</style>

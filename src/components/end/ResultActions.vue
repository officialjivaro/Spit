<template>
  <div class="result-actions">
    <AppButton v-if="canRetry" @click="emit('retry')">Play Again</AppButton>
    <AppButton variant="secondary" @click="emit('copy')">{{ copyLabel }}</AppButton>
    <AppButton variant="quiet" @click="emit('home')">Return Home</AppButton>
  </div>
</template>

<script setup>
import AppButton from '../ui/AppButton.vue'

defineProps({
  canRetry: {
    type: Boolean,
    default: true
  },
  copyLabel: {
    type: String,
    default: 'Copy Result'
  }
})

const emit = defineEmits(['retry', 'copy', 'home'])
</script>

<style scoped>
.result-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.55rem;
}
</style>

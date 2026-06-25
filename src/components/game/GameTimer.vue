<template>
  <span class="game-timer status-chip" :class="{ 'game-timer--urgent': isUrgent }">
    {{ timerType === 'countdown' ? 'Left' : 'Time' }} {{ displayTime }}
  </span>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { formatTime } from '../../utils/formatTime.js'

const props = defineProps({
  timerType: {
    type: String,
    default: 'elapsed',
    validator: value => ['elapsed', 'countdown'].includes(value)
  },
  startedAt: {
    type: Number,
    default: null
  },
  deadline: {
    type: Number,
    default: null
  }
})

const emit = defineEmits(['expired'])
const now = ref(Date.now())
let intervalId = null
let expiredEmitted = false

const displaySeconds = computed(() => {
  if (props.timerType === 'countdown') {
    return Math.max(0, Math.ceil(((props.deadline || now.value) - now.value) / 1000))
  }

  return Math.max(0, Math.floor((now.value - (props.startedAt || now.value)) / 1000))
})

const displayTime = computed(() => formatTime(displaySeconds.value))
const isUrgent = computed(() => props.timerType === 'countdown' && displaySeconds.value <= 60)

function updateClock() {
  now.value = Date.now()

  if (props.timerType === 'countdown' && displaySeconds.value <= 0 && !expiredEmitted) {
    expiredEmitted = true
    emit('expired')
  }
}

onMounted(() => {
  updateClock()
  intervalId = window.setInterval(updateClock, 250)
})

onBeforeUnmount(() => window.clearInterval(intervalId))
</script>

<style scoped>
.game-timer {
  font-size: clamp(0.68rem, 1.55vmin, 0.88rem);
}

.game-timer--urgent {
  border-color: rgba(163, 47, 76, 0.65);
  background: rgba(255, 211, 221, 0.95);
  color: #7a1f38;
}
</style>

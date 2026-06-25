<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import ResultSummary from '../components/results/ResultSummary.vue'
import { useGameStore } from '../stores/game.js'

const router = useRouter()
const store = useGameStore()

function rematch() {
  store.rematch()
  router.replace({ name: 'play' })
}

function goHome() {
  store.abandonGame({ keepResult: true })
  router.push({ name: 'home' })
}

onMounted(() => {
  if (!store.result) router.replace({ name: 'home' })
})
</script>

<template>
  <!-- Results Screen | Shows only when a completed session is available -->
  <section v-if="store.result" class="results-view">
    <ResultSummary :result="store.result" @rematch="rematch" @home="goHome" />
  </section>
</template>

<style scoped>
.results-view {
  width: 100%;
  height: 100%;
  min-height: 0;
  display: grid;
  place-items: center;
  padding: clamp(0.6rem, 2vw, 1.5rem);
  overflow: hidden;
}
</style>

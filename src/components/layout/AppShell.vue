<script setup>
import { useGameStore } from '../../stores/game.js'
import AppHeader from './AppHeader.vue'

const store = useGameStore()
store.initialize()
</script>

<template>
  <!-- App Shell | Provides a fixed, industrial iframe-safe viewport -->
  <div class="app-shell">
    <div class="ambient-grid" aria-hidden="true"></div>
    <div class="ambient-orb ambient-orb--left" aria-hidden="true"></div>
    <div class="ambient-orb ambient-orb--right" aria-hidden="true"></div>
    <AppHeader />
    <main class="app-content">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.app-shell {
  position: relative;
  isolation: isolate;
  width: 100%;
  height: 100dvh;
  overflow: hidden;
  display: grid;
  grid-template-rows: var(--header-height) minmax(0, 1fr);
  background:
    radial-gradient(circle at 11% 17%, rgba(166, 64, 52, 0.15), transparent 29%),
    radial-gradient(circle at 87% 83%, rgba(61, 117, 111, 0.13), transparent 33%),
    linear-gradient(145deg, #080a08 0%, #202019 49%, #121512 100%);
}

.app-shell::before {
  content: '';
  position: absolute;
  z-index: 1;
  inset: 0;
  pointer-events: none;
  background:
    linear-gradient(90deg, rgba(255, 234, 190, 0.025), transparent 20% 80%, rgba(255, 234, 190, 0.02)),
    radial-gradient(ellipse at center, transparent 50%, rgba(0, 0, 0, 0.44));
}

.app-content {
  position: relative;
  z-index: 2;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}

.ambient-grid {
  position: absolute;
  z-index: 0;
  inset: 0;
  pointer-events: none;
  opacity: 0.2;
  background-image:
    linear-gradient(rgba(203, 165, 91, 0.045) 1px, transparent 1px),
    linear-gradient(90deg, rgba(203, 165, 91, 0.045) 1px, transparent 1px),
    linear-gradient(135deg, transparent 0 49.7%, rgba(132, 55, 44, 0.03) 50%, transparent 50.3%);
  background-size: 3rem 3rem, 3rem 3rem, 6rem 6rem;
  mask-image: linear-gradient(to bottom, transparent 2%, #000 25%, #000 82%, transparent 100%);
  animation: grid-shift 28s linear infinite;
}

.ambient-orb {
  position: absolute;
  z-index: 0;
  width: min(32rem, 52vw);
  aspect-ratio: 1;
  border-radius: 50%;
  filter: blur(100px);
  opacity: 0.1;
  pointer-events: none;
  animation: ambient-drift 13s ease-in-out infinite;
}

.ambient-orb--left {
  left: -18rem;
  top: 8%;
  background: var(--color-accent);
}

.ambient-orb--right {
  right: -18rem;
  bottom: -13rem;
  background: var(--color-secondary);
  animation-delay: -4s;
}
</style>

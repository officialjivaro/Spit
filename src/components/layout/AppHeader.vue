<script setup>
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useGameStore } from '../../stores/game.js'

const route = useRoute()
const store = useGameStore()

const showHome = computed(() => route.name !== 'home')
const showPause = computed(
  () =>
    route.name === 'play' &&
    (
      ['playing', 'refreshing'].includes(store.status) ||
      (store.status === 'paused' && store.pauseReason === 'manual')
    )
)
const pauseLabel = computed(() => (store.status === 'paused' ? 'Resume' : 'Pause'))
const statusLabel = computed(() => {
  if (store.status === 'countdown') return 'Systems Ready'
  if (store.status === 'refreshing') return 'Reserve Sync'
  if (store.status === 'paused') return 'Paused'
  if (store.status === 'playing') {
    if (store.modeId === 'practice') {
      return store.practiceStage === 'free' ? 'Practice AI' : 'Training'
    }
    return `${store.selectedDifficulty.name} · ${store.classificationLabel}`
  }
  if (store.status === 'finished') return 'Complete'
  return store.selectedMode.name
})

function togglePause() {
  if (['playing', 'refreshing'].includes(store.status)) store.pauseGame('manual')
  else if (store.status === 'paused') store.resumeGame()
}
</script>

<template>
  <!-- App Header | Keeps Jivaro navigation, branding, and lifecycle controls visible -->
  <header class="app-header">
    <nav class="header-navigation" aria-label="SpeedGame navigation">
      <a
        class="header-control"
        href="https://jivaro.net/games"
        target="_top"
        aria-label="Return to Jivaro Games"
      >
        <span aria-hidden="true">←</span>
        <span class="control-label">Games</span>
      </a>

      <RouterLink
        v-if="showHome"
        class="header-control"
        to="/"
        aria-label="Return to the SpeedGame home screen"
      >
        <span aria-hidden="true">⌂</span>
        <span class="control-label">Home</span>
      </RouterLink>
    </nav>

    <div class="brand" aria-label="SpeedGame">
      <div class="brand-name"><span>Speed</span><span class="brand-accent">Game</span></div>
      <div class="brand-subtitle">React · Play · Empty</div>
    </div>

    <div class="header-tools">
      <span
        class="status-chip"
        :class="{ 'status-chip--active': store.status === 'playing' }"
      >
        <i aria-hidden="true"></i>
        {{ statusLabel }}
      </span>
      <button v-if="showPause" class="header-control" type="button" @click="togglePause">
        <span aria-hidden="true">{{ store.status === 'paused' ? '▶' : 'Ⅱ' }}</span>
        <span class="control-label">{{ pauseLabel }}</span>
      </button>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  position: relative;
  z-index: var(--z-header);
  width: 100%;
  height: var(--header-height);
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid rgba(207, 174, 107, 0.58);
  background:
    linear-gradient(180deg, rgba(255, 239, 199, 0.055), transparent 34%),
    repeating-linear-gradient(90deg, rgba(255, 239, 199, 0.018) 0 1px, transparent 1px 0.72rem),
    linear-gradient(135deg, #11120f 0%, #302e25 52%, #191a16 100%);
  box-shadow:
    0 9px 28px rgba(0, 0, 0, 0.56),
    0 -1px 0 rgba(0, 0, 0, 0.75) inset;
}

.app-header::before,
.app-header::after {
  content: '';
  position: absolute;
  pointer-events: none;
}

.app-header::before {
  inset: 0.35rem 0.55rem;
  border-top: 1px solid rgba(222, 190, 125, 0.08);
  border-bottom: 1px solid rgba(0, 0, 0, 0.34);
}

.app-header::after {
  inset: auto 0 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--color-accent), var(--color-brass-bright), var(--color-secondary), transparent);
  box-shadow: 0 0 14px rgba(166, 64, 52, 0.42);
}

.header-navigation,
.header-tools {
  position: absolute;
  z-index: 2;
  top: 50%;
  display: flex;
  align-items: center;
  gap: clamp(0.2rem, 0.65vw, 0.55rem);
  transform: translateY(-50%);
}

.header-navigation {
  left: clamp(0.4rem, 1.5vw, 1.4rem);
}

.header-tools {
  right: clamp(0.4rem, 1.5vw, 1.4rem);
}

.header-control,
.status-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  min-height: 2.25rem;
  padding: 0.42rem 0.72rem;
  border: 1px solid rgba(194, 158, 88, 0.38);
  border-radius: var(--radius-small);
  color: var(--color-text);
  background:
    linear-gradient(180deg, rgba(73, 69, 56, 0.94), rgba(30, 30, 25, 0.98));
  box-shadow:
    0 7px 16px rgba(0, 0, 0, 0.4),
    0 1px 0 rgba(255, 232, 182, 0.08) inset;
  text-decoration: none;
}

button.header-control {
  cursor: pointer;
}

.header-control:hover {
  border-color: var(--color-brass-bright);
  transform: translateY(-1px);
  box-shadow:
    0 9px 20px rgba(0, 0, 0, 0.46),
    var(--shadow-brass);
}

.control-label,
.status-chip {
  font-size: clamp(0.58rem, 0.85vw, 0.74rem);
  font-weight: 850;
  letter-spacing: 0.075em;
  text-transform: uppercase;
}

.status-chip {
  color: var(--color-secondary-bright);
  background: rgba(14, 17, 14, 0.72);
}

.status-chip i {
  width: 0.46rem;
  aspect-ratio: 1;
  border-radius: 50%;
  background: currentColor;
  box-shadow: 0 0 0.7rem currentColor;
  opacity: 0.72;
}

.status-chip--active i {
  color: var(--color-success);
  animation: status-pulse 1.3s ease-in-out infinite;
}

.brand {
  position: absolute;
  z-index: 1;
  left: 50%;
  top: 50%;
  width: max-content;
  max-width: 38%;
  text-align: center;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.brand-name {
  font-family: var(--font-display);
  font-size: clamp(1rem, 2.5vw, 1.9rem);
  font-weight: 900;
  line-height: 1;
  letter-spacing: 0.055em;
  text-transform: uppercase;
  text-shadow:
    0 3px 12px rgba(0, 0, 0, 0.8),
    0 0 16px rgba(166, 64, 52, 0.18);
}

.brand-accent {
  color: var(--color-accent-bright);
}

.brand-subtitle {
  margin-top: 0.22rem;
  color: var(--color-text-muted);
  font-size: clamp(0.48rem, 0.85vw, 0.65rem);
  font-weight: 750;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

@media (max-width: 780px) {
  .control-label,
  .brand-subtitle,
  .status-chip {
    display: none;
  }

  .header-control {
    min-width: 2.2rem;
    padding-inline: 0.55rem;
  }
}
</style>

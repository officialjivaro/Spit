<script setup>
import { computed } from 'vue'

const props = defineProps({
  difficulty: {
    type: String,
    required: true
  },
  modeName: {
    type: String,
    required: true
  },
  classification: {
    type: String,
    required: true
  },
  elapsedMs: {
    type: Number,
    default: 0
  },
  playerRemaining: {
    type: Number,
    default: 0
  },
  computerRemaining: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    required: true
  }
})

const formattedTime = computed(() => {
  const totalSeconds = Math.max(0, props.elapsedMs) / 1000
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = (totalSeconds % 60).toFixed(1).padStart(4, '0')
  return `${String(minutes).padStart(2, '0')}:${seconds}`
})

const centerLabel = computed(() =>
  props.classification === 'Practice' ? props.modeName : `${props.difficulty} · ${props.classification}`
)
</script>

<template>
  <!-- Game HUD | Summarizes race progress and match classification -->
  <div class="game-hud" aria-label="Current game information">
    <div class="hud-item">
      <span>CPU</span>
      <strong>{{ computerRemaining }}</strong>
    </div>
    <div class="hud-item hud-item--time">
      <span>{{ centerLabel }}</span>
      <strong>{{ formattedTime }}</strong>
    </div>
    <div class="hud-item">
      <span>You</span>
      <strong>{{ playerRemaining }}</strong>
    </div>
    <span class="sr-only" aria-live="polite">Game status: {{ status }}</span>
  </div>
</template>

<style scoped>
.game-hud {
  min-width: min(100%, 25rem);
  display: grid;
  grid-template-columns: 1fr 1.7fr 1fr;
  align-items: stretch;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-small);
  overflow: hidden;
  background: repeating-linear-gradient(90deg, rgba(214, 177, 106, 0.025) 0 1px, transparent 1px 0.7rem), linear-gradient(180deg, rgba(57, 55, 45, 0.72), rgba(14, 17, 14, 0.88));
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.34), 0 1px 0 rgba(255, 230, 181, 0.05) inset;
}

.hud-item {
  display: grid;
  grid-template-columns: auto auto;
  align-items: baseline;
  justify-content: center;
  gap: 0.3rem;
  padding: 0.32rem 0.55rem;
}

.hud-item + .hud-item { border-left: 1px solid rgba(195, 157, 85, 0.18); }

.hud-item span {
  color: var(--color-text-muted);
  font-size: clamp(0.44rem, 0.72vw, 0.58rem);
  font-weight: 850;
  letter-spacing: 0.07em;
  text-transform: uppercase;
}

.hud-item strong {
  color: var(--color-brass-bright);
  font-family: var(--font-display);
  font-size: clamp(0.64rem, 1.15vw, 0.86rem);
}

.hud-item:first-child strong { color: var(--color-secondary-bright); }
.hud-item:last-child strong { color: var(--color-accent-bright); }

.hud-item--time {
  grid-template-columns: 1fr;
  justify-items: center;
  gap: 0.04rem;
}

.hud-item--time strong {
  min-width: 4.4rem;
  color: var(--color-parchment);
  font-variant-numeric: tabular-nums;
  text-align: center;
}

@media (max-height: 420px) {
  .hud-item { padding-block: 0.18rem; }
  .hud-item--time span { display: none; }
}
</style>

<script setup>
import CenterZone from './CenterZone.vue'
import PlayerZone from './PlayerZone.vue'

const props = defineProps({
  game: {
    type: Object,
    required: true
  },
  selectedSlot: {
    type: Number,
    default: null
  },
  disabled: {
    type: Boolean,
    default: false
  },
  showOpponentCards: {
    type: Boolean,
    default: false
  },
  legalSlots: {
    type: Array,
    default: () => []
  },
  legalPiles: {
    type: Array,
    default: () => []
  },
  aiActive: {
    type: Boolean,
    default: true
  },
  events: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['select-slot', 'select-pile'])
</script>

<template>
  <!-- Game Board | Arranges hands, reserves, and center piles in a fixed viewport -->
  <div class="game-board">
    <PlayerZone
      label="Computer"
      actor="computer"
      :hand="game.computer.hand"
      :draw-count="game.computer.drawPile.length"
      :disabled="disabled"
      :show-cards="showOpponentCards"
      :ai-active="aiActive"
      :events="events"
    />

    <CenterZone
      :center-piles="game.centerPiles"
      :reserve-piles="game.reservePiles"
      :disabled="disabled"
      :legal-piles="legalPiles"
      :events="events"
      @select-pile="emit('select-pile', $event)"
    />

    <PlayerZone
      label="Your Hand"
      actor="player"
      :hand="game.player.hand"
      :draw-count="game.player.drawPile.length"
      :selected-slot="selectedSlot"
      :disabled="disabled"
      :legal-slots="legalSlots"
      :events="events"
      @select-slot="emit('select-slot', $event)"
    />
  </div>
</template>

<style scoped>
.game-board {
  position: relative;
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  display: grid;
  grid-template-rows: minmax(0, 1fr) auto minmax(0, 1fr);
  gap: clamp(0.12rem, 0.58vh, 0.42rem);
  padding: clamp(0.35rem, 0.9vw, 0.68rem) clamp(0.48rem, 1.3vw, 1.1rem);
  overflow: hidden;
  border: 1px solid rgba(192, 155, 84, 0.3);
  border-radius: var(--radius-large);
  background:
    linear-gradient(90deg, transparent 49.85%, rgba(188, 150, 77, 0.06) 50%, transparent 50.15%),
    radial-gradient(ellipse at center, rgba(166, 64, 52, 0.075), transparent 48%),
    repeating-linear-gradient(0deg, rgba(224, 193, 129, 0.018) 0 1px, transparent 1px 0.52rem),
    linear-gradient(145deg, rgba(38, 38, 31, 0.92), rgba(12, 15, 12, 0.96));
  box-shadow: var(--shadow-panel), 0 0 2rem rgba(0, 0, 0, 0.28) inset, 0 0 1.5rem rgba(166, 64, 52, 0.06) inset;
}

.game-board::before,
.game-board::after {
  content: '';
  position: absolute;
  z-index: 3;
  width: 0.46rem;
  height: 0.46rem;
  border: 1px solid rgba(214, 178, 105, 0.44);
  border-radius: 50%;
  background: #2b2a23;
  pointer-events: none;
}
.game-board::before { left: 0.46rem; top: 0.46rem; }
.game-board::after { right: 0.46rem; bottom: 0.46rem; }

@media (max-width: 480px) {
  .game-board { padding-inline: 0.28rem; }
}

@media (max-height: 430px) {
  .game-board {
    gap: 0;
    padding-block: 0.12rem;
  }
}
</style>

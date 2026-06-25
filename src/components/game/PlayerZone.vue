<script setup>
import { computed } from 'vue'
import CardSlot from './CardSlot.vue'

const props = defineProps({
  label: {
    type: String,
    required: true
  },
  hand: {
    type: Array,
    required: true
  },
  drawCount: {
    type: Number,
    required: true
  },
  actor: {
    type: String,
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
  showCards: {
    type: Boolean,
    default: false
  },
  legalSlots: {
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

const emit = defineEmits(['select-slot'])

const latestActorEvent = computed(() =>
  [...props.events]
    .reverse()
    .find((event) => event.actor === props.actor && ['play', 'draw', 'ai-mistake'].includes(event.type))
)

function invalidEventId(slotIndex) {
  const event = [...props.events]
    .reverse()
    .find(
      (item) =>
        item.type === 'invalid' &&
        item.actor === props.actor &&
        (item.slotIndex === slotIndex || item.slotIndex === null)
    )
  return event?.id || 0
}

function mistakeEvent(slotIndex) {
  if (props.actor !== 'computer') return null
  return (
    [...props.events]
      .reverse()
      .find((item) => item.type === 'ai-mistake' && item.slotIndex === slotIndex) || null
  )
}
</script>

<template>
  <!-- Player Zone | Displays fixed hand slots, draw pile, hints, and AI activity -->
  <section class="player-zone" :class="`player-zone--${actor}`" :aria-label="`${label} cards`">
    <div class="zone-heading">
      <div class="zone-title">
        <span class="zone-eyebrow">{{ actor === 'player' ? 'Player One' : 'Opponent' }}</span>
        <h2>{{ label }}</h2>
      </div>

      <span
        v-if="actor === 'computer'"
        :key="latestActorEvent?.id || 0"
        class="ai-indicator"
        :class="{ 'ai-indicator--waiting': !aiActive }"
        :aria-label="aiActive ? 'Computer opponent active' : 'Computer opponent waiting'"
      >
        <i aria-hidden="true"></i>
        {{ aiActive ? 'AI active' : 'AI waiting' }}
      </span>

      <div class="draw-count" :aria-label="`${drawCount} cards left in draw pile`">
        <span class="mini-card" aria-hidden="true"></span>
        <strong>{{ drawCount }}</strong>
        <small>Draw</small>
      </div>
    </div>

    <div class="hand-row">
      <CardSlot
        v-for="(card, index) in hand"
        :key="`${actor}-${index}`"
        :card="card"
        :slot-index="index"
        :face-down="actor === 'computer' && !showCards"
        :interactive="actor === 'player'"
        :selected="actor === 'player' && selectedSlot === index"
        :legal="actor === 'player' && legalSlots.includes(index)"
        :disabled="disabled"
        :invalid-event-id="invalidEventId(index)"
        :mistake-event="mistakeEvent(index)"
        @select="emit('select-slot', $event)"
      />
    </div>
  </section>
</template>

<style scoped>
.player-zone {
  min-width: 0;
  min-height: 0;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  gap: clamp(0.28rem, 0.7vh, 0.5rem);
}

.zone-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.6rem;
}

.zone-title { min-width: 0; margin-right: auto; }

.zone-eyebrow {
  display: block;
  color: var(--color-text-muted);
  font-size: clamp(0.44rem, 0.72vw, 0.59rem);
  font-weight: 800;
  letter-spacing: 0.15em;
  text-transform: uppercase;
}

.zone-heading h2 {
  margin: 0.08rem 0 0;
  font-family: var(--font-display);
  font-size: clamp(0.7rem, 1.3vw, 0.98rem);
  letter-spacing: 0.055em;
  text-transform: uppercase;
}

.player-zone--player h2 { color: var(--color-accent-bright); }
.player-zone--computer h2 { color: var(--color-secondary-bright); }

.ai-indicator {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  color: var(--color-secondary-bright);
  font-size: clamp(0.4rem, 0.62vw, 0.53rem);
  font-weight: 850;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.ai-indicator i {
  width: 0.4rem;
  aspect-ratio: 1;
  border-radius: 50%;
  background: var(--color-success);
  box-shadow: 0 0 0.6rem rgba(141, 167, 103, 0.6);
  animation: status-pulse 1.2s ease-in-out infinite;
}

.ai-indicator--waiting { color: var(--color-warning); }
.ai-indicator--waiting i { background: currentColor; box-shadow: 0 0 0.5rem currentColor; animation: none; }

.draw-count {
  display: grid;
  grid-template-columns: auto auto;
  grid-template-rows: auto auto;
  align-items: center;
  column-gap: 0.34rem;
  padding: 0.26rem 0.5rem;
  border: 1px solid rgba(190, 154, 84, 0.28);
  border-radius: var(--radius-small);
  background: linear-gradient(180deg, rgba(57, 55, 45, 0.68), rgba(17, 19, 16, 0.82));
  box-shadow: 0 5px 12px rgba(0, 0, 0, 0.24) inset;
}

.draw-count strong {
  color: var(--color-parchment);
  font-family: var(--font-display);
  font-size: clamp(0.66rem, 1.2vw, 0.9rem);
  line-height: 1;
}

.draw-count small {
  color: var(--color-text-muted);
  font-size: 0.45rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.mini-card {
  grid-row: 1 / 3;
  width: 0.86rem;
  height: 1.12rem;
  border: 1px solid var(--color-brass);
  border-radius: 0.12rem;
  background: linear-gradient(135deg, transparent 43%, rgba(166, 64, 52, 0.48) 44% 56%, transparent 57%), #191c18;
}

.hand-row {
  min-width: 0;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: clamp(0.28rem, 1vw, 0.78rem);
  padding: 0.06rem 0.5rem 0.62rem;
}

@media (max-width: 700px) {
  .zone-heading { padding-inline: 0.18rem; }
  .ai-indicator { display: none; }
  .hand-row { gap: 0.18rem; padding-inline: 0; }
}

@media (max-height: 430px) {
  .player-zone { gap: 0.08rem; }
  .zone-eyebrow,
  .ai-indicator,
  .draw-count small { display: none; }
  .zone-heading h2 { margin: 0; font-size: 0.62rem; }
  .draw-count { padding: 0.12rem 0.3rem; }
  .mini-card { width: 0.62rem; height: 0.8rem; }
  .hand-row { padding-bottom: 0.4rem; }
}
</style>

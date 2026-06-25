<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import PlayingCard from './PlayingCard.vue'

const props = defineProps({
  centerPiles: {
    type: Array,
    required: true
  },
  reservePiles: {
    type: Array,
    required: true
  },
  disabled: {
    type: Boolean,
    default: false
  },
  legalPiles: {
    type: Array,
    default: () => []
  },
  events: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['select-pile'])

const latestReserveEvent = computed(() =>
  [...props.events]
    .reverse()
    .find((event) => ['reserve-reveal', 'recycle'].includes(event.type))
)

const latestMistake = computed(() =>
  [...props.events].reverse().find((event) => event.type === 'ai-mistake')
)

const rejectedPile = ref(null)
let rejectedTimer = null

watch(
  () => latestMistake.value?.id,
  (eventId) => {
    if (!eventId) return
    window.clearTimeout(rejectedTimer)
    rejectedPile.value = null
    window.requestAnimationFrame(() => {
      rejectedPile.value = latestMistake.value?.pileIndex ?? null
      rejectedTimer = window.setTimeout(() => {
        rejectedPile.value = null
      }, 660)
    })
  }
)

onBeforeUnmount(() => window.clearTimeout(rejectedTimer))

function topCard(pileIndex) {
  return props.centerPiles[pileIndex]?.at(-1) || null
}

function latestPileEventId(pileIndex) {
  const event = [...props.events]
    .reverse()
    .find(
      (item) =>
        (item.type === 'play' && item.pileIndex === pileIndex) ||
        item.type === 'reserve-reveal'
    )
  return event?.id || 0
}

function isLegalPile(pileIndex) {
  return props.legalPiles.includes(pileIndex)
}
</script>

<template>
  <!-- Center Zone | Separates player and computer reserves from active play piles -->
  <section class="center-zone" aria-label="Center play area">
    <div v-for="pileNumber in 2" :key="pileNumber" class="pile-group">
      <div
        :key="`reserve-${pileNumber}-${latestReserveEvent?.id || 0}`"
        class="reserve-unit"
        :class="{ 'reserve-unit--active': latestReserveEvent?.type === 'reserve-reveal' }"
      >
        <div
          class="reserve-stack"
          :aria-label="`${reservePiles[pileNumber - 1].length} cards in the ${pileNumber === 1 ? 'player' : 'computer'} reserve`"
        >
          <PlayingCard
            v-if="reservePiles[pileNumber - 1].length"
            :key="reservePiles[pileNumber - 1].at(-1).id"
            :card="reservePiles[pileNumber - 1].at(-1)"
            face-down
            compact
          />
          <span v-else class="empty-reserve">Spent</span>
          <strong>{{ reservePiles[pileNumber - 1].length }}</strong>
        </div>
        <small>{{ pileNumber === 1 ? 'Your reserve' : 'CPU reserve' }}</small>
      </div>

      <button
        class="center-pile"
        :class="{
          'center-pile--left': pileNumber === 1,
          'center-pile--right': pileNumber === 2,
          'center-pile--legal': isLegalPile(pileNumber - 1),
          'center-pile--rejected': rejectedPile === pileNumber - 1,
          'center-pile--updated': latestPileEventId(pileNumber - 1)
        }"
        type="button"
        :disabled="disabled"
        :aria-label="`Play selected card on the ${pileNumber === 1 ? 'left' : 'right'} pile${isLegalPile(pileNumber - 1) ? ', legal destination' : ''}`"
        @click="emit('select-pile', pileNumber - 1)"
      >
        <span class="direction-label" aria-hidden="true">{{ pileNumber === 1 ? '←' : '→' }}</span>
        <span v-if="isLegalPile(pileNumber - 1)" class="destination-flag" aria-hidden="true">Valid</span>

        <PlayingCard
          v-if="topCard(pileNumber - 1)"
          :key="topCard(pileNumber - 1).id"
          class="center-top-card"
          :card="topCard(pileNumber - 1)"
        />

        <span v-else class="missing-center-card" role="status">Card unavailable</span>
      </button>
    </div>
  </section>
</template>

<style scoped>
.center-zone {
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: clamp(0.7rem, 2.8vw, 2.4rem);
  padding: 0.1rem var(--space-2);
}

.pile-group {
  display: flex;
  align-items: center;
  gap: clamp(0.3rem, 1vw, 0.7rem);
}

.center-pile,
.reserve-stack {
  position: relative;
  width: var(--card-width);
  aspect-ratio: 1 / var(--card-ratio);
  padding: 0;
  border-radius: var(--radius-card);
}

.center-pile {
  overflow: visible;
  border: 1px solid rgba(207, 174, 107, 0.5);
  background:
    linear-gradient(135deg, transparent 0 0.5rem, rgba(19, 20, 18, 0.96) 0.52rem),
    repeating-linear-gradient(45deg, rgba(183, 139, 70, 0.045) 0 0.32rem, transparent 0.32rem 0.7rem),
    #101310;
  box-shadow: 0 9px 20px rgba(0, 0, 0, 0.26) inset, 0 0 0 1px rgba(255, 237, 195, 0.035);
  cursor: pointer;
  opacity: 1;
  touch-action: manipulation;
  transition: transform var(--transition-fast), border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.center-pile::before,
.center-pile::after {
  content: '';
  position: absolute;
  z-index: 3;
  width: 0.35rem;
  height: 0.35rem;
  border: 1px solid rgba(210, 176, 106, 0.5);
  border-radius: 50%;
  background: #27251e;
  pointer-events: none;
}
.center-pile::before { left: 0.28rem; top: 0.28rem; }
.center-pile::after { right: 0.28rem; top: 0.28rem; }

.center-pile:hover:not(:disabled) {
  z-index: 3;
  border-color: var(--color-accent-bright);
  transform: translateY(-0.2rem) scale(1.025);
  box-shadow: 0 9px 20px rgba(0, 0, 0, 0.22) inset, var(--shadow-accent);
}
.center-pile:disabled { cursor: default; opacity: 1; }

.center-pile--legal {
  border-color: var(--color-hint);
  box-shadow: 0 0 0 0.14rem rgba(141, 167, 103, 0.18), 0 0 1.5rem rgba(141, 167, 103, 0.3);
  animation: legal-breathe 1.6s ease-in-out infinite;
}

.center-pile--rejected { animation: pile-reject 620ms ease; }

.center-top-card {
  position: absolute;
  inset: 0;
  z-index: 1;
  animation: center-card-arrive var(--transition-medium) both;
}

.direction-label {
  position: absolute;
  z-index: 5;
  left: 50%;
  bottom: -0.68rem;
  display: grid;
  width: 1.65rem;
  height: 1.32rem;
  place-items: center;
  border: 1px solid var(--color-brass);
  border-radius: 0.24rem;
  color: var(--color-parchment);
  font-size: 0.9rem;
  background: linear-gradient(180deg, #4a3924, #211c15);
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.5), 0 1px 0 rgba(255, 225, 168, 0.14) inset;
  transform: translateX(-50%);
}

.destination-flag {
  position: absolute;
  z-index: 6;
  left: 50%;
  top: -0.5rem;
  padding: 0.12rem 0.38rem;
  border-radius: var(--radius-pill);
  color: #13170f;
  font-size: 0.42rem;
  font-weight: 900;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  background: var(--color-hint);
  transform: translateX(-50%);
}

.reserve-unit {
  display: grid;
  justify-items: center;
  gap: 0.18rem;
}

.reserve-unit small {
  color: var(--color-text-muted);
  font-size: 0.42rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  white-space: nowrap;
}

.reserve-stack {
  width: calc(var(--card-width) * 0.68);
  opacity: 0.88;
  transform: rotate(-3deg);
}

.pile-group:nth-child(2) .reserve-unit { order: 2; }
.pile-group:nth-child(2) .reserve-stack { transform: rotate(3deg); }

.reserve-stack::before,
.reserve-stack::after {
  content: '';
  position: absolute;
  z-index: -1;
  inset: 0;
  border: 1px solid rgba(181, 145, 79, 0.35);
  border-radius: inherit;
  background: #191b17;
}
.reserve-stack::before { transform: translate(-0.16rem, 0.16rem); }
.reserve-stack::after { transform: translate(-0.3rem, 0.3rem); }

.reserve-stack strong {
  position: absolute;
  z-index: 4;
  right: -0.36rem;
  top: -0.36rem;
  display: grid;
  min-width: 1.2rem;
  height: 1.2rem;
  place-items: center;
  border: 1px solid rgba(255, 224, 161, 0.32);
  border-radius: 50%;
  color: #1d1810;
  font-size: 0.62rem;
  background: var(--color-brass-bright);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.46);
}

.reserve-unit--active { animation: reserve-feed 560ms ease; }

.empty-reserve {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  border: 1px dashed rgba(190, 153, 87, 0.34);
  border-radius: inherit;
  color: var(--color-text-muted);
  font-size: 0.48rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  background: rgba(14, 16, 14, 0.72);
}

.missing-center-card {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 0.5rem;
  color: var(--color-danger);
  font-size: 0.58rem;
  font-weight: 800;
  text-transform: uppercase;
}

@media (max-width: 700px) {
  .center-zone { gap: 0.42rem; padding-inline: 0; }
  .pile-group { gap: 0.18rem; }
  .reserve-unit small { display: none; }
}

@media (max-width: 420px), (max-height: 420px) {
  .reserve-stack { width: calc(var(--card-width) * 0.58); }
  .destination-flag { display: none; }
  .direction-label { bottom: -0.48rem; width: 1.3rem; height: 1.1rem; font-size: 0.7rem; }
}
</style>

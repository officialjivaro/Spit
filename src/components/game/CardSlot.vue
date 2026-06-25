<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { getCardLabel } from '../../game/cards.js'
import PlayingCard from './PlayingCard.vue'

const props = defineProps({
  card: {
    type: Object,
    default: null
  },
  slotIndex: {
    type: Number,
    required: true
  },
  faceDown: {
    type: Boolean,
    default: false
  },
  interactive: {
    type: Boolean,
    default: false
  },
  selected: {
    type: Boolean,
    default: false
  },
  legal: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  invalidEventId: {
    type: Number,
    default: 0
  },
  mistakeEvent: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['select'])
const shaking = ref(false)
const mistakeDirection = ref(null)
let shakeTimer = null
let mistakeTimer = null

const accessibleLabel = computed(() => {
  const slot = props.slotIndex + 1
  if (!props.card) return `${props.interactive ? 'Refill' : 'Computer'} empty slot ${slot}`
  if (props.faceDown) return `Computer card slot ${slot}, face down`
  const prefix = props.interactive ? `Select slot ${slot}` : `Computer slot ${slot}`
  return `${prefix}, ${getCardLabel(props.card)}${props.legal ? ', legal move available' : ''}`
})

watch(
  () => props.invalidEventId,
  (eventId) => {
    if (!eventId) return
    window.clearTimeout(shakeTimer)
    shaking.value = false
    window.requestAnimationFrame(() => {
      shaking.value = true
      shakeTimer = window.setTimeout(() => {
        shaking.value = false
      }, 360)
    })
  }
)

watch(
  () => props.mistakeEvent?.id,
  (eventId) => {
    if (!eventId) return
    window.clearTimeout(mistakeTimer)
    mistakeDirection.value = props.mistakeEvent.pileIndex === 0 ? 'left' : 'right'
    mistakeTimer = window.setTimeout(() => {
      mistakeDirection.value = null
    }, 680)
  }
)

onBeforeUnmount(() => {
  window.clearTimeout(shakeTimer)
  window.clearTimeout(mistakeTimer)
})
</script>

<template>
  <!-- Card Slot | Supports keyboard selection, pointer taps, hints, and rejected AI attempts -->
  <button
    v-if="interactive"
    class="card-slot card-slot--button"
    :class="{
      'card-slot--selected': selected,
      'card-slot--legal': legal,
      'card-slot--invalid': shaking,
      'card-slot--empty': !card
    }"
    type="button"
    :disabled="disabled"
    :aria-label="accessibleLabel"
    :aria-pressed="selected"
    :style="{ '--slot-delay': `${slotIndex * 55}ms` }"
    @click="emit('select', slotIndex)"
  >
    <span class="slot-key" aria-hidden="true">{{ slotIndex + 1 }}</span>
    <span v-if="legal" class="legal-flag" aria-hidden="true">Ready</span>

    <PlayingCard v-if="card" :key="card.id" class="slot-card" :card="card" />

    <span v-else class="empty-copy">
      <span class="empty-mark" aria-hidden="true">＋</span>
      <strong>Empty slot</strong>
      <small>Press {{ slotIndex + 1 }} or tap to draw</small>
    </span>
  </button>

  <div
    v-else
    class="card-slot card-slot--opponent"
    :class="[
      { 'card-slot--empty': !card },
      mistakeDirection ? `card-slot--mistake-${mistakeDirection}` : ''
    ]"
    :style="{ '--slot-delay': `${slotIndex * 55}ms` }"
    :aria-label="accessibleLabel"
  >
    <PlayingCard
      v-if="card"
      :key="card.id"
      class="slot-card"
      :card="card"
      :face-down="faceDown"
    />

    <span v-else class="empty-copy empty-copy--opponent">
      <span class="empty-mark" aria-hidden="true">×</span>
      <strong>Vacant</strong>
    </span>
  </div>
</template>

<style scoped>
.card-slot {
  position: relative;
  width: var(--card-width);
  aspect-ratio: 1 / var(--card-ratio);
  min-width: 0;
  padding: 0;
  overflow: visible;
  border: 1px solid var(--color-slot-border);
  border-radius: var(--radius-card);
  color: var(--color-text-muted);
  background:
    linear-gradient(135deg, transparent 0 0.48rem, rgba(18, 19, 17, 0.88) 0.5rem),
    repeating-linear-gradient(135deg, rgba(198, 157, 83, 0.035) 0 0.28rem, transparent 0.28rem 0.62rem),
    var(--color-slot);
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.24) inset, 0 0 0 1px rgba(255, 244, 214, 0.025);
  transition: transform var(--transition-fast), border-color var(--transition-fast), box-shadow var(--transition-fast);
  animation: card-deal var(--transition-slow) both;
  animation-delay: var(--slot-delay);
  opacity: 1;
  touch-action: manipulation;
  -webkit-user-select: none;
  user-select: none;
}

.card-slot::before,
.card-slot::after {
  content: '';
  position: absolute;
  z-index: 2;
  width: 0.34rem;
  height: 0.34rem;
  border: 1px solid rgba(209, 177, 111, 0.45);
  border-radius: 50%;
  background: #26251f;
  pointer-events: none;
}

.card-slot::before { left: 0.28rem; top: 0.28rem; }
.card-slot::after { right: 0.28rem; top: 0.28rem; }

.card-slot--button { cursor: pointer; }
.card-slot--button:hover:not(:disabled) {
  border-color: var(--color-brass-bright);
  transform: translateY(-0.18rem);
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.2) inset, 0 0 1.1rem rgba(181, 64, 49, 0.18);
}
.card-slot--button:disabled { cursor: default; opacity: 1; }

.card-slot--selected {
  z-index: 4;
  border-color: var(--color-accent-bright);
  transform: translateY(-0.5rem) scale(1.04);
  box-shadow: 0 0 0 0.15rem rgba(181, 64, 49, 0.2), var(--shadow-accent);
}

.card-slot--legal:not(.card-slot--selected) {
  border-color: var(--color-hint);
  box-shadow: 0 0 0 0.1rem rgba(141, 167, 103, 0.18), 0 0 1.15rem rgba(141, 167, 103, 0.25);
  animation: card-deal var(--transition-slow) both, legal-breathe 1.6s ease-in-out infinite;
}

.card-slot--invalid {
  border-color: var(--color-danger);
  animation: invalid-shake 340ms ease;
}

.card-slot--mistake-left { animation: ai-mistake-left 650ms ease both; }
.card-slot--mistake-right { animation: ai-mistake-right 650ms ease both; }

.card-slot--empty {
  border-style: dashed;
  border-color: rgba(196, 164, 101, 0.42);
  background:
    linear-gradient(135deg, transparent 0 0.48rem, rgba(19, 20, 18, 0.92) 0.5rem),
    repeating-linear-gradient(-45deg, rgba(190, 151, 78, 0.055) 0 0.32rem, transparent 0.32rem 0.68rem),
    #111411;
}

.slot-card { position: absolute; inset: 0; z-index: 1; }

.slot-key {
  position: absolute;
  z-index: 5;
  left: 50%;
  bottom: -0.58rem;
  display: grid;
  min-width: 1.35rem;
  height: 1.35rem;
  place-items: center;
  padding-inline: 0.2rem;
  border: 1px solid var(--color-brass);
  border-radius: 0.24rem;
  color: var(--color-parchment);
  font-family: var(--font-display);
  font-size: 0.64rem;
  background: linear-gradient(180deg, #4a3924, #211c15);
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.5), 0 1px 0 rgba(255, 224, 164, 0.15) inset;
  transform: translateX(-50%);
}

.legal-flag {
  position: absolute;
  z-index: 6;
  left: 50%;
  top: -0.48rem;
  padding: 0.12rem 0.34rem;
  border: 1px solid rgba(141, 167, 103, 0.62);
  border-radius: var(--radius-pill);
  color: #13170f;
  font-size: 0.42rem;
  font-weight: 900;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  background: var(--color-hint);
  transform: translateX(-50%);
}

.empty-copy {
  position: absolute;
  z-index: 1;
  inset: 0;
  display: grid;
  place-content: center;
  justify-items: center;
  gap: 0.14rem;
  padding: 0.45rem;
  color: var(--color-text-muted);
  font-size: clamp(0.46rem, 0.82vw, 0.65rem);
  letter-spacing: 0.045em;
  text-align: center;
  text-transform: uppercase;
}

.empty-copy strong { color: var(--color-brass-bright); font-size: 0.92em; }
.empty-copy small { color: var(--color-text-muted); font-size: 0.68em; line-height: 1.2; }

.empty-mark {
  display: grid;
  width: 1.35rem;
  aspect-ratio: 1;
  place-items: center;
  margin-bottom: 0.06rem;
  border: 1px solid rgba(196, 164, 101, 0.38);
  border-radius: 50%;
  color: var(--color-accent-bright);
  font-size: 0.76rem;
  background: rgba(62, 30, 25, 0.36);
}

.empty-copy--opponent { opacity: 0.76; }
.empty-copy--opponent .empty-mark {
  color: var(--color-secondary-bright);
  background: rgba(31, 65, 61, 0.26);
}

@media (max-width: 420px), (max-height: 420px) {
  .empty-copy small,
  .legal-flag {
    display: none;
  }
  .slot-key { bottom: -0.45rem; min-width: 1.1rem; height: 1.1rem; font-size: 0.55rem; }
}
</style>

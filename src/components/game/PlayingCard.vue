<script setup>
import { computed } from 'vue'
import { getCardLabel } from '../../game/cards.js'

const props = defineProps({
  card: {
    type: Object,
    default: null
  },
  faceDown: {
    type: Boolean,
    default: false
  },
  compact: {
    type: Boolean,
    default: false
  }
})

const ariaLabel = computed(() => {
  if (props.faceDown) return 'Face-down card'
  if (!props.card) return 'Empty card position'
  return getCardLabel(props.card)
})
</script>

<template>
  <!-- Playing Card | Uses a parchment face and industrial mechanical card back -->
  <article
    class="playing-card"
    :class="[
      {
        'playing-card--down': faceDown,
        'playing-card--compact': compact,
        'playing-card--empty': !card
      },
      card && !faceDown ? `playing-card--${card.color}` : ''
    ]"
    :aria-label="ariaLabel"
  >
    <template v-if="card && !faceDown">
      <div class="card-corner card-corner--top">
        <strong>{{ card.rankLabel }}</strong>
        <span>{{ card.suitSymbol }}</span>
      </div>
      <span class="card-center" aria-hidden="true">{{ card.suitSymbol }}</span>
      <div class="card-corner card-corner--bottom" aria-hidden="true">
        <strong>{{ card.rankLabel }}</strong>
        <span>{{ card.suitSymbol }}</span>
      </div>
      <span class="card-serial" aria-hidden="true">SG-{{ card.id }}</span>
    </template>

    <template v-else-if="faceDown">
      <div class="card-back" aria-hidden="true">
        <span class="card-back-ring"><b>SG</b></span>
        <i class="card-back-line card-back-line--one"></i>
        <i class="card-back-line card-back-line--two"></i>
      </div>
    </template>

    <span v-else class="card-missing">No card</span>
  </article>
</template>

<style scoped>
.playing-card {
  position: relative;
  width: 100%;
  height: 100%;
  min-width: 0;
  overflow: hidden;
  border: 1px solid rgba(62, 49, 32, 0.72);
  border-radius: var(--radius-card);
  color: var(--color-card-ink);
  background:
    linear-gradient(115deg, transparent 0 65%, rgba(116, 76, 40, 0.055) 65.2% 65.8%, transparent 66%),
    radial-gradient(circle at 76% 17%, rgba(154, 73, 47, 0.08), transparent 25%),
    linear-gradient(145deg, var(--color-card-highlight), var(--color-card));
  box-shadow: var(--shadow-card);
  user-select: none;
  animation: card-arrive var(--transition-medium) both;
}

.playing-card::before {
  content: '';
  position: absolute;
  z-index: 0;
  inset: 0.2rem;
  border: 1px solid rgba(92, 66, 38, 0.14);
  border-radius: calc(var(--radius-card) - 0.16rem);
  pointer-events: none;
}

.playing-card::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  box-shadow:
    0 0 0 1px rgba(255, 249, 226, 0.48) inset,
    0 -0.22rem 0.7rem rgba(92, 57, 28, 0.08) inset;
}

.playing-card--red {
  color: var(--color-card-red);
}

.card-corner {
  position: absolute;
  z-index: 1;
  display: grid;
  place-items: center;
  line-height: 0.82;
}

.card-corner strong {
  font-family: var(--font-display);
  font-size: clamp(0.74rem, 1.8vw, 1.35rem);
  letter-spacing: -0.04em;
}

.card-corner span {
  margin-top: 0.12rem;
  font-size: clamp(0.65rem, 1.4vw, 1.05rem);
}

.card-corner--top {
  top: 7%;
  left: 9%;
}

.card-corner--bottom {
  right: 9%;
  bottom: 7%;
  transform: rotate(180deg);
}

.card-center {
  position: absolute;
  z-index: 1;
  left: 50%;
  top: 50%;
  font-size: clamp(1.55rem, 4.2vw, 3.25rem);
  line-height: 1;
  transform: translate(-50%, -50%);
  filter: drop-shadow(0 2px 1px rgba(0, 0, 0, 0.14));
}

.card-serial {
  position: absolute;
  z-index: 1;
  left: 50%;
  bottom: 3.5%;
  color: rgba(54, 45, 33, 0.32);
  font-family: var(--font-display);
  font-size: clamp(0.28rem, 0.48vw, 0.42rem);
  letter-spacing: 0.08em;
  transform: translateX(-50%);
}

.playing-card--down {
  padding: 5%;
  border-color: rgba(198, 157, 83, 0.68);
  background:
    linear-gradient(145deg, #2a2922, #121613 62%, #2f1715);
  box-shadow:
    var(--shadow-card),
    0 0 1.1rem rgba(110, 47, 40, 0.18);
}

.card-back {
  position: relative;
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  overflow: hidden;
  border: 2px solid rgba(198, 157, 83, 0.48);
  border-radius: calc(var(--radius-card) - 0.14rem);
  background:
    repeating-linear-gradient(0deg, rgba(215, 177, 105, 0.045) 0 1px, transparent 1px 0.48rem),
    repeating-linear-gradient(90deg, rgba(215, 177, 105, 0.045) 0 1px, transparent 1px 0.48rem),
    linear-gradient(135deg, transparent 0 47%, rgba(164, 64, 50, 0.3) 47.5% 52.5%, transparent 53%),
    linear-gradient(45deg, transparent 0 47%, rgba(69, 126, 117, 0.22) 47.5% 52.5%, transparent 53%),
    #171b17;
}

.card-back::before,
.card-back::after {
  content: '';
  position: absolute;
  inset: 8%;
  border: 1px solid rgba(203, 169, 99, 0.26);
  transform: rotate(45deg);
}

.card-back::after {
  inset: 18%;
  border-color: rgba(110, 156, 143, 0.28);
  transform: rotate(-45deg);
}

.card-back-ring {
  position: relative;
  z-index: 2;
  display: grid;
  width: 49%;
  aspect-ratio: 1;
  place-items: center;
  border: 1px solid var(--color-brass-bright);
  border-radius: 50%;
  color: var(--color-parchment);
  background:
    radial-gradient(circle, rgba(142, 54, 44, 0.72) 0 35%, rgba(21, 25, 22, 0.96) 36% 62%, rgba(178, 137, 66, 0.5) 63% 66%, #171b17 67%);
  box-shadow:
    0 0 1rem rgba(169, 61, 47, 0.24),
    0 0 0 0.18rem rgba(13, 16, 14, 0.7);
}

.card-back-ring b {
  font-family: var(--font-display);
  font-size: clamp(0.54rem, 1.4vw, 0.92rem);
  letter-spacing: 0.08em;
}

.card-back-line {
  position: absolute;
  z-index: 1;
  width: 80%;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(211, 174, 101, 0.42), transparent);
}

.card-back-line--one {
  transform: rotate(28deg);
}

.card-back-line--two {
  transform: rotate(-28deg);
}

.playing-card--compact .card-center {
  font-size: clamp(1rem, 2.4vw, 1.75rem);
}

.playing-card--empty {
  display: grid;
  place-items: center;
  border-style: dashed;
  color: var(--color-danger);
  background: var(--color-slot);
}

.card-missing {
  font-size: 0.58rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
</style>

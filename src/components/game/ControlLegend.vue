<script setup>
import { computed } from 'vue'

const props = defineProps({
  selectedSlot: {
    type: Number,
    default: null
  },
  selectionRemainingMs: {
    type: Number,
    default: 0
  },
  inputMethod: {
    type: String,
    default: ''
  },
  autoRefill: {
    type: Boolean,
    default: false
  }
})

const remainingSeconds = computed(() => Math.max(0, props.selectionRemainingMs / 1000).toFixed(1))
</script>

<template>
  <!-- Control Legend | Confirms keyboard and pointer selection state -->
  <div class="control-legend" aria-label="Game controls">
    <template v-if="selectedSlot !== null">
      <span class="selected-copy">
        Slot <strong>{{ selectedSlot + 1 }}</strong> selected
        <small v-if="inputMethod === 'keyboard'">{{ remainingSeconds }}s</small>
      </span>
      <span><kbd>←</kbd><kbd>→</kbd> or tap a pile</span>
      <span class="cancel-copy">Select the card again to cancel</span>
    </template>
    <template v-else>
      <span><kbd>1–5</kbd> or tap a card</span>
      <span class="legend-plus">+</span>
      <span><kbd>←</kbd><kbd>→</kbd> or tap a pile</span>
      <span class="legend-separator">•</span>
      <span>{{ autoRefill ? 'Empty slots refill automatically' : 'Press or tap an empty slot to draw' }}</span>
    </template>
  </div>
</template>

<style scoped>
.control-legend {
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.34rem;
  color: var(--color-text-muted);
  font-size: clamp(0.48rem, 0.76vw, 0.64rem);
  font-weight: 720;
  text-align: center;
}

kbd {
  display: inline-grid;
  min-width: 1.28rem;
  min-height: 1.18rem;
  place-items: center;
  margin-inline: 0.06rem;
  padding: 0.08rem 0.28rem;
  border: 1px solid var(--color-brass);
  border-bottom-width: 2px;
  border-radius: 0.22rem;
  color: var(--color-parchment);
  font-family: var(--font-display);
  background: linear-gradient(180deg, #493923, #211c15);
}

.selected-copy {
  padding: 0.22rem 0.45rem;
  border: 1px solid rgba(212, 107, 82, 0.48);
  border-radius: var(--radius-small);
  color: var(--color-parchment);
  background: rgba(77, 31, 26, 0.5);
}

.selected-copy strong { color: var(--color-accent-bright); }
.selected-copy small { margin-left: 0.3rem; color: var(--color-brass-bright); font-variant-numeric: tabular-nums; }
.legend-plus,
.legend-separator { color: var(--color-brass-bright); }
.cancel-copy { opacity: 0.75; }

@media (max-width: 620px) {
  .cancel-copy,
  .legend-separator,
  .control-legend span:last-child {
    display: none;
  }
}

@media (max-height: 420px) {
  .control-legend { display: none; }
}
</style>

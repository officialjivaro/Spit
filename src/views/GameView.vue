<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { onBeforeRouteLeave, useRouter } from 'vue-router'
import ControlLegend from '../components/game/ControlLegend.vue'
import GameBoard from '../components/game/GameBoard.vue'
import GameHud from '../components/game/GameHud.vue'
import GameOverlay from '../components/game/GameOverlay.vue'
import PracticeGuide from '../components/game/PracticeGuide.vue'
import {
  COUNTDOWN_STEP_MS,
  isGameViewportUsable
} from '../config/gameOptions.js'
import { useAutoRefillController } from '../composables/useAutoRefillController.js'
import { useKeyboardControls } from '../composables/useKeyboardControls.js'
import { useOpponentController } from '../composables/useOpponentController.js'
import { useStallController } from '../composables/useStallController.js'
import { getLegalPileIndices, getLegalSlotIndices } from '../game/rules.js'
import { useGameStore } from '../stores/game.js'

const router = useRouter()
const store = useGameStore()
const surfaceRef = ref(null)
const countdownValue = ref(3)
const focusInterrupted = ref(false)
const tooSmall = ref(false)
const now = ref(Date.now())
let countdownTimer = null
let clockTimer = null
let finishTimer = null

const {
  selectedSlot,
  selectedInput,
  selectionExpiresAt,
  selectSlot,
  attemptPile,
  clearSelection
} = useKeyboardControls(store)
useOpponentController(store)
useAutoRefillController(store)
const { stallStage } = useStallController(store)

const elapsedMs = computed(() => store.currentElapsedMs(now.value))
const boardDisabled = computed(() => store.status !== 'playing')
const hintsEnabled = computed(() => Boolean(store.activeSettings.highlightLegalMoves))
const legalSlots = computed(() => {
  if (!hintsEnabled.value || !store.game) return []
  if (selectedSlot.value !== null) {
    return getLegalPileIndices(store.game, 'player', selectedSlot.value).length > 0
      ? [selectedSlot.value]
      : []
  }
  return getLegalSlotIndices(store.game, 'player')
})
const legalPiles = computed(() => {
  if (!hintsEnabled.value || !store.game || selectedSlot.value === null) return []
  return getLegalPileIndices(store.game, 'player', selectedSlot.value)
})
const selectionRemainingMs = computed(() =>
  selectionExpiresAt.value ? Math.max(0, selectionExpiresAt.value - now.value) : 0
)

const overlayKind = computed(() => {
  if (tooSmall.value) return 'viewport'
  if (store.status === 'countdown' && focusInterrupted.value) return 'focus'
  if (store.status === 'countdown') return 'countdown'
  if (store.status === 'paused' && (focusInterrupted.value || store.pauseReason === 'focus')) {
    return 'focus'
  }
  if (store.status === 'paused') return 'pause'
  if (store.status === 'refreshing') return 'stall'
  return null
})

const latestAnnouncement = computed(() => {
  const event = store.lastEvents.at(-1)
  if (!event) return ''
  if (event.type === 'invalid') {
    if (event.reason === 'select-a-card-first') return 'Select a card before choosing a center pile.'
    if (event.reason === 'illegal-rank') return 'That card cannot be placed on the selected pile.'
    return 'That action is not available.'
  }
  if (event.type === 'draw') {
    return `${event.actor === 'player' ? 'You drew' : 'Computer drew'} a card into slot ${event.slotIndex + 1}.`
  }
  if (event.type === 'play') {
    return `${event.actor === 'player' ? 'You played' : 'Computer played'} a card to the ${event.pileIndex === 0 ? 'left' : 'right'} pile.`
  }
  if (event.type === 'ai-mistake') {
    return `Computer attempted an invalid card on the ${event.pileIndex === 0 ? 'left' : 'right'} pile and took it back.`
  }
  if (event.type === 'reserve-reveal') return 'Both reserves placed a new card on the center piles.'
  if (event.type === 'recycle') return 'Buried center cards were recycled into the reserves.'
  if (event.type === 'practice-complete') return 'Guided steps complete. The slow opponent is now active.'
  return ''
})

const stallAnnouncement = computed(() => {
  if (store.status !== 'refreshing') return ''
  if (stallStage.value === 'warning') return 'No moves. Reserve countdown begins.'
  if (stallStage.value === '1' || stallStage.value === '2') return `Reserve countdown ${stallStage.value}.`
  if (stallStage.value === 'reveal') return 'Revealing both reserve cards.'
  return ''
})

function clearCountdown() {
  if (countdownTimer !== null) window.clearTimeout(countdownTimer)
  countdownTimer = null
}

function advanceCountdown(reset = false) {
  clearCountdown()
  if (reset) countdownValue.value = 3
  if (store.status !== 'countdown' || focusInterrupted.value || tooSmall.value) return

  countdownTimer = window.setTimeout(() => {
    if (countdownValue.value > 0) {
      countdownValue.value -= 1
      advanceCountdown(false)
    } else {
      store.beginPlaying()
    }
  }, countdownValue.value === 0 ? 420 : COUNTDOWN_STEP_MS)
}

function focusSurface() {
  nextTick(() => surfaceRef.value?.focus({ preventScroll: true }))
}

function resumeGame() {
  if (tooSmall.value) return
  focusInterrupted.value = false
  focusSurface()
  if (store.status === 'countdown') advanceCountdown(false)
  else if (store.status === 'paused') store.resumeGame()
}

function handleFocusLoss() {
  focusInterrupted.value = true
  clearSelection()
  clearCountdown()
  if (['playing', 'refreshing'].includes(store.status)) store.pauseGame('focus')
}

function handleVisibilityChange() {
  if (document.hidden) handleFocusLoss()
}

function updateViewport() {
  const wasTooSmall = tooSmall.value
  tooSmall.value = !isGameViewportUsable(window.innerWidth, window.innerHeight)

  if (!wasTooSmall && tooSmall.value) {
    clearSelection()
    clearCountdown()
    if (['playing', 'refreshing'].includes(store.status)) store.pauseGame('viewport')
    return
  }

  if (wasTooSmall && !tooSmall.value && store.status === 'countdown' && !focusInterrupted.value) {
    focusSurface()
    advanceCountdown(false)
  }
}

function handleSurfacePointer(event) {
  if (
    event.target === surfaceRef.value &&
    !focusInterrupted.value &&
    store.status === 'playing'
  ) {
    focusSurface()
  }
}

function handleSlotSelect(slotIndex) {
  selectSlot(slotIndex, 'pointer')
}

watch(
  () => store.status,
  (status) => {
    if (status === 'finished') {
      clearCountdown()
      finishTimer = window.setTimeout(() => router.replace({ name: 'results' }), 480)
    }
  }
)

onMounted(() => {
  if (!store.game || !['countdown', 'playing', 'paused', 'refreshing'].includes(store.status)) {
    router.replace({ name: 'home' })
    return
  }

  updateViewport()
  focusSurface()
  window.addEventListener('resize', updateViewport)
  window.addEventListener('blur', handleFocusLoss)
  document.addEventListener('visibilitychange', handleVisibilityChange)
  clockTimer = window.setInterval(() => {
    now.value = Date.now()
  }, 100)

  if (store.status === 'countdown') advanceCountdown(true)
})

onBeforeUnmount(() => {
  clearCountdown()
  window.clearInterval(clockTimer)
  window.clearTimeout(finishTimer)
  window.removeEventListener('resize', updateViewport)
  window.removeEventListener('blur', handleFocusLoss)
  document.removeEventListener('visibilitychange', handleVisibilityChange)
})

onBeforeRouteLeave((to) => {
  if (to.name === 'results' || !store.hasLiveSession) return true
  const leave = window.confirm('Leave this game? The current round will be discarded.')
  if (leave) store.abandonGame()
  return leave
})
</script>

<template>
  <!-- Game Screen | Connects rules, natural AI, deadlocks, practice, and all input methods -->
  <section
    v-if="store.game"
    ref="surfaceRef"
    class="game-view"
    tabindex="-1"
    aria-label="SpeedGame card table"
    @pointerdown="handleSurfacePointer"
  >
    <div class="game-topline">
      <GameHud
        :difficulty="store.selectedDifficulty.name"
        :mode-name="store.selectedMode.name"
        :classification="store.classificationLabel"
        :elapsed-ms="elapsedMs"
        :player-remaining="store.playerRemaining"
        :computer-remaining="store.computerRemaining"
        :status="store.status"
      />
      <ControlLegend
        :selected-slot="selectedSlot"
        :selection-remaining-ms="selectionRemainingMs"
        :input-method="selectedInput"
        :auto-refill="store.activeSettings.autoRefillPlayer"
      />
    </div>

    <GameBoard
      :game="store.game"
      :selected-slot="selectedSlot"
      :disabled="boardDisabled"
      :show-opponent-cards="store.activeSettings.showOpponentCards"
      :legal-slots="legalSlots"
      :legal-piles="legalPiles"
      :ai-active="store.canOpponentAct"
      :events="store.lastEvents"
      @select-slot="handleSlotSelect"
      @select-pile="attemptPile"
    />

    <PracticeGuide
      v-if="store.modeId === 'practice' && ['playing', 'refreshing'].includes(store.status)"
      :stage="store.practiceStage"
      :target-slot="store.practiceTargetSlot"
    />

    <GameOverlay
      v-if="overlayKind"
      :kind="overlayKind"
      :countdown="countdownValue"
      :stall-stage="stallStage"
      @resume="resumeGame"
    />

    <p class="sr-only" aria-live="polite">{{ latestAnnouncement }}</p>
    <p class="sr-only" aria-live="assertive">{{ stallAnnouncement }}</p>
  </section>
</template>

<style scoped>
.game-view {
  position: relative;
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  gap: clamp(0.25rem, 0.65vh, 0.48rem);
  padding: clamp(0.35rem, 0.9vw, 0.72rem);
  overflow: hidden;
  outline: none;
}

.game-topline {
  min-width: 0;
  display: grid;
  grid-template-columns: minmax(17rem, 0.8fr) minmax(19rem, 1.2fr);
  align-items: center;
  gap: var(--space-2);
}

@media (max-width: 760px) {
  .game-topline { grid-template-columns: 1fr; gap: 0.2rem; }
}

@media (max-width: 480px) {
  .game-view { padding: 0.25rem; }
}

@media (max-height: 430px) {
  .game-view { gap: 0.12rem; padding-block: 0.16rem; }
  .game-topline { grid-template-columns: minmax(0, 1fr); }
}
</style>

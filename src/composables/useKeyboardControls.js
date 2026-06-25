import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import {
  KEYBOARD_SELECTION_MS,
  POINTER_SELECTION_MS
} from '../config/gameOptions.js'

// Input Controls | Converts keyboard, mouse, and tap selection into semantic actions
export function useKeyboardControls(store) {
  const selectedSlot = ref(null)
  const selectedInput = ref('')
  const selectionExpiresAt = ref(null)
  let selectionTimer = null

  function clearSelection({ preservePractice = false } = {}) {
    if (selectionTimer !== null) window.clearTimeout(selectionTimer)
    selectionTimer = null
    selectedSlot.value = null
    selectedInput.value = ''
    selectionExpiresAt.value = null
    if (!preservePractice) store.cancelPracticeSelection()
  }

  function armSlot(slotIndex, inputMethod) {
    clearSelection({ preservePractice: true })
    const duration = inputMethod === 'keyboard' ? KEYBOARD_SELECTION_MS : POINTER_SELECTION_MS
    selectedSlot.value = slotIndex
    selectedInput.value = inputMethod
    selectionExpiresAt.value = Date.now() + duration
    selectionTimer = window.setTimeout(clearSelection, duration)
    store.notePracticeSelection(slotIndex)
  }

  function selectSlot(slotIndex, inputMethod = 'pointer') {
    if (store.status !== 'playing' || !store.game) return
    if (!Number.isInteger(slotIndex) || slotIndex < 0 || slotIndex > 4) return

    const card = store.game.player.hand[slotIndex]
    if (card) {
      if (selectedSlot.value === slotIndex) {
        clearSelection()
        return
      }
      armSlot(slotIndex, inputMethod)
      return
    }

    clearSelection()
    store.performPlayerAction({ type: 'draw', slotIndex, source: inputMethod })
  }

  function attemptPile(pileIndex) {
    if (store.status !== 'playing') return

    if (selectedSlot.value === null) {
      store.recordInputError('select-a-card-first', { pileIndex })
      return
    }

    const slotIndex = selectedSlot.value
    clearSelection({ preservePractice: true })
    const valid = store.performPlayerAction({ type: 'play', slotIndex, pileIndex })
    if (!valid) store.cancelPracticeSelection()
  }

  function digitFromEvent(event) {
    const codeMatch = /^(?:Digit|Numpad)([1-5])$/.exec(event.code)
    if (codeMatch) return Number(codeMatch[1]) - 1
    if (/^[1-5]$/.test(event.key)) return Number(event.key) - 1
    return null
  }

  function isEditableTarget(target) {
    return ['INPUT', 'TEXTAREA', 'SELECT'].includes(target?.tagName) || target?.isContentEditable
  }

  function handleKeydown(event) {
    if (event.defaultPrevented || event.repeat || event.ctrlKey || event.metaKey || event.altKey) return
    if (isEditableTarget(event.target)) return

    if (event.key === 'Escape') {
      event.preventDefault()
      if (['playing', 'refreshing'].includes(store.status)) store.pauseGame('manual')
      else if (store.status === 'paused' && store.pauseReason === 'manual') store.resumeGame()
      return
    }

    if (store.status !== 'playing') return

    const slotIndex = digitFromEvent(event)
    if (slotIndex !== null) {
      event.preventDefault()
      selectSlot(slotIndex, 'keyboard')
      return
    }

    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault()
      attemptPile(event.key === 'ArrowLeft' ? 0 : 1)
    }
  }

  watch(
    () => [store.sessionId, store.status],
    () => {
      if (store.status !== 'playing') clearSelection()
    }
  )

  onMounted(() => window.addEventListener('keydown', handleKeydown))
  onBeforeUnmount(() => {
    clearSelection()
    window.removeEventListener('keydown', handleKeydown)
  })

  return {
    selectedSlot,
    selectedInput,
    selectionExpiresAt,
    selectSlot,
    attemptPile,
    clearSelection
  }
}

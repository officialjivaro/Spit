import { onScopeDispose, watch } from 'vue'
import { AUTO_REFILL_DELAY_MS } from '../config/gameOptions.js'

// Auto Refill | Refills one newly emptied player slot after a cancellable delay
export function useAutoRefillController(store) {
  const timerApi = typeof window === 'undefined' ? globalThis : window
  const timers = new Map()
  let disposed = false
  let lastProcessedEventId = store.eventCounter || 0

  function clearSlot(slotIndex) {
    const timerId = timers.get(slotIndex)
    if (timerId !== undefined) timerApi.clearTimeout(timerId)
    timers.delete(slotIndex)
  }

  function clearAll() {
    for (const timerId of timers.values()) timerApi.clearTimeout(timerId)
    timers.clear()
  }

  function schedule(slotIndex) {
    clearSlot(slotIndex)
    if (!store.activeSettings.autoRefillPlayer || store.status !== 'playing') return

    const sessionId = store.sessionId
    const timerId = timerApi.setTimeout(() => {
      timers.delete(slotIndex)
      if (
        disposed ||
        store.status !== 'playing' ||
        store.sessionId !== sessionId ||
        !store.activeSettings.autoRefillPlayer ||
        !store.game ||
        store.game.player.hand[slotIndex] ||
        store.game.player.drawPile.length === 0
      ) {
        return
      }

      store.performPlayerAction({ type: 'draw', slotIndex, source: 'auto' })
    }, AUTO_REFILL_DELAY_MS)

    timers.set(slotIndex, timerId)
  }

  function processLatestEvent() {
    const newEvents = store.lastEvents.filter((event) => event.id > lastProcessedEventId)
    for (const event of newEvents) {
      lastProcessedEventId = Math.max(lastProcessedEventId, event.id)
      if (event.actor !== 'player' || !Number.isInteger(event.slotIndex)) continue
      if (event.type === 'play') schedule(event.slotIndex)
      if (event.type === 'draw') clearSlot(event.slotIndex)
    }
  }

  const stopEventWatch = watch(
    () => store.lastEvents.map((event) => event.id),
    processLatestEvent,
    { flush: 'sync' }
  )
  const stopLifecycleWatch = watch(
    [() => store.status, () => store.sessionId, () => store.activeSettings.autoRefillPlayer],
    () => {
      if (store.status !== 'playing' || !store.activeSettings.autoRefillPlayer) clearAll()
      lastProcessedEventId = store.eventCounter || 0
    },
    { flush: 'sync' }
  )

  onScopeDispose(() => {
    disposed = true
    stopEventWatch()
    stopLifecycleWatch()
    clearAll()
  })

  return { clearAll, clearSlot, schedule }
}

import { onScopeDispose, ref, watch } from 'vue'
import {
  STALL_COUNT_STEP_MS,
  STALL_REVEAL_MS,
  STALL_WARNING_MS
} from '../config/gameOptions.js'

// Stall Controller | Presents one cancellable NO MOVES, 1, 2, reveal sequence
export function useStallController(store, random = Math.random) {
  const timerApi = typeof window === 'undefined' ? globalThis : window
  const stallStage = ref(null)
  let timerId = null
  let disposed = false

  function clearTimer() {
    if (timerId !== null) timerApi.clearTimeout(timerId)
    timerId = null
  }

  function stop() {
    clearTimer()
    stallStage.value = null
  }

  function later(callback, delay) {
    clearTimer()
    timerId = timerApi.setTimeout(callback, delay)
  }

  function start() {
    stop()
    if (disposed || store.status !== 'refreshing' || !store.game) return

    const sessionId = store.sessionId
    const stallRevision = store.stallRevision
    const stillCurrent = () =>
      !disposed &&
      store.status === 'refreshing' &&
      store.sessionId === sessionId &&
      store.stallRevision === stallRevision

    stallStage.value = 'warning'
    later(() => {
      if (!stillCurrent()) return stop()
      stallStage.value = '1'
      later(() => {
        if (!stillCurrent()) return stop()
        stallStage.value = '2'
        later(() => {
          if (!stillCurrent()) return stop()
          stallStage.value = 'reveal'
          later(() => {
            if (!stillCurrent()) return stop()
            store.resolveCurrentStall(random)
          }, STALL_REVEAL_MS)
        }, STALL_COUNT_STEP_MS)
      }, STALL_COUNT_STEP_MS)
    }, STALL_WARNING_MS)
  }

  const stopWatching = watch(
    [() => store.status, () => store.sessionId, () => store.stallRevision],
    start,
    { immediate: true, flush: 'sync' }
  )

  onScopeDispose(() => {
    disposed = true
    stopWatching()
    stop()
  })

  return { stallStage, start, stop }
}

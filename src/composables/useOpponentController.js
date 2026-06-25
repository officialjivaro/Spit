import { onScopeDispose, watch } from 'vue'
import {
  AI_MISTAKE_MAX_RECOVERY_MS,
  AI_MISTAKE_MIN_RECOVERY_MS,
  getOpponentTiming
} from '../config/gameOptions.js'

// Opponent Controller | Runs one independent loop with newly sampled natural delays
export function useOpponentController(
  store,
  timingRandom = Math.random,
  decisionRandom = Math.random
) {
  const timerApi = typeof window === 'undefined' ? globalThis : window
  let timerId = null
  let disposed = false

  function safeRandom(source) {
    return Math.min(Math.max(Number(source()) || 0, 0), 0.999999999)
  }

  function sampleRange(minimum, maximum) {
    return Math.round(minimum + safeRandom(timingRandom) * (maximum - minimum))
  }

  function clearTimer() {
    if (timerId !== null) timerApi.clearTimeout(timerId)
    timerId = null
  }

  function isRunnable() {
    return Boolean(store.canOpponentAct)
  }

  function nextDelay(kind = 'normal') {
    if (kind === 'mistake-recovery') {
      return sampleRange(AI_MISTAKE_MIN_RECOVERY_MS, AI_MISTAKE_MAX_RECOVERY_MS)
    }
    const timing = getOpponentTiming(store.modeId, store.difficultyId)
    return sampleRange(timing.minDelay, timing.maxDelay)
  }

  function schedule(kind = 'normal') {
    clearTimer()
    if (disposed || !isRunnable()) return

    const scheduledSessionId = store.sessionId
    timerId = timerApi.setTimeout(() => {
      timerId = null
      if (disposed || !isRunnable() || store.sessionId !== scheduledSessionId) return

      const result = store.performComputerTurn(decisionRandom)
      schedule(result?.mistake ? 'mistake-recovery' : 'normal')
    }, nextDelay(kind))
  }

  const stopWatching = watch(
    [
      () => store.status,
      () => store.sessionId,
      () => store.difficultyId,
      () => store.modeId,
      () => store.practiceStage
    ],
    () => schedule('normal'),
    { immediate: true, flush: 'sync' }
  )

  onScopeDispose(() => {
    disposed = true
    stopWatching()
    clearTimer()
  })

  return { clearTimer, schedule, nextDelay }
}

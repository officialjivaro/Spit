import { effectScope, reactive } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useStallController } from '../src/composables/useStallController.js'

describe('stall countdown controller', () => {
  let originalWindow

  beforeEach(() => {
    vi.useFakeTimers()
    originalWindow = globalThis.window
    globalThis.window = globalThis
  })

  afterEach(() => {
    vi.useRealTimers()
    if (originalWindow === undefined) delete globalThis.window
    else globalThis.window = originalWindow
  })

  function createStore(overrides = {}) {
    return reactive({
      status: 'refreshing',
      game: { outcome: null },
      sessionId: 1,
      stallRevision: 1,
      resolveCurrentStall: vi.fn(() => true),
      ...overrides
    })
  }

  it('shows NO MOVES, 1, 2, then resolves exactly one pair', async () => {
    const store = createStore()
    const scope = effectScope()
    let controller
    scope.run(() => {
      controller = useStallController(store, () => 0)
    })

    expect(controller.stallStage.value).toBe('warning')
    await vi.advanceTimersByTimeAsync(650)
    expect(controller.stallStage.value).toBe('1')
    await vi.advanceTimersByTimeAsync(650)
    expect(controller.stallStage.value).toBe('2')
    await vi.advanceTimersByTimeAsync(650)
    expect(controller.stallStage.value).toBe('reveal')
    await vi.advanceTimersByTimeAsync(259)
    expect(store.resolveCurrentStall).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(1)
    expect(store.resolveCurrentStall).toHaveBeenCalledTimes(1)
    scope.stop()
  })

  it('cancels when the match pauses', async () => {
    const store = createStore()
    const scope = effectScope()
    scope.run(() => useStallController(store, () => 0))
    await vi.advanceTimersByTimeAsync(900)
    store.status = 'paused'
    await vi.advanceTimersByTimeAsync(5000)
    expect(store.resolveCurrentStall).not.toHaveBeenCalled()
    scope.stop()
  })

  it('restarts visibly when the resolved pair is still blocked', async () => {
    const store = createStore()
    store.resolveCurrentStall = vi.fn(() => {
      store.stallRevision += 1
      return true
    })
    const scope = effectScope()
    let controller
    scope.run(() => {
      controller = useStallController(store, () => 0)
    })
    await vi.advanceTimersByTimeAsync(2210)
    expect(store.resolveCurrentStall).toHaveBeenCalledTimes(1)
    expect(controller.stallStage.value).toBe('warning')
    await vi.advanceTimersByTimeAsync(2210)
    expect(store.resolveCurrentStall).toHaveBeenCalledTimes(2)
    scope.stop()
  })

  it('cannot resolve an old session timer', async () => {
    const store = createStore()
    const scope = effectScope()
    scope.run(() => useStallController(store, () => 0))
    await vi.advanceTimersByTimeAsync(1000)
    store.sessionId += 1
    store.status = 'playing'
    await vi.advanceTimersByTimeAsync(5000)
    expect(store.resolveCurrentStall).not.toHaveBeenCalled()
    scope.stop()
  })
})

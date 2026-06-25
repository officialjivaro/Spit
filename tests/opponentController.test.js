import { effectScope, reactive } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useOpponentController } from '../src/composables/useOpponentController.js'

function sequence(values) {
  let index = 0
  return () => values[Math.min(index++, values.length - 1)]
}

describe('opponent controller', () => {
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
      status: 'countdown',
      game: { outcome: null },
      sessionId: 1,
      actionRevision: 0,
      difficultyId: 'easy',
      modeId: 'quick',
      practiceStage: 'off',
      get canOpponentAct() {
        return this.status === 'playing' && this.game && !this.game.outcome && (this.modeId !== 'practice' || this.practiceStage === 'free')
      },
      performComputerTurn: vi.fn(() => ({ performed: true, mistake: false })),
      ...overrides
    })
  }

  it('starts when play begins and keeps taking independent actions', async () => {
    const store = createStore()
    const scope = effectScope()
    scope.run(() => useOpponentController(store, () => 0))

    await vi.advanceTimersByTimeAsync(4000)
    expect(store.performComputerTurn).not.toHaveBeenCalled()
    store.status = 'playing'
    await vi.advanceTimersByTimeAsync(1499)
    expect(store.performComputerTurn).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(1)
    expect(store.performComputerTurn).toHaveBeenCalledTimes(1)
    await vi.advanceTimersByTimeAsync(1500)
    expect(store.performComputerTurn).toHaveBeenCalledTimes(2)
    scope.stop()
  })

  it('samples a fresh value from the reaction range for every cycle', async () => {
    const store = createStore({ status: 'playing' })
    const scope = effectScope()
    scope.run(() => useOpponentController(store, sequence([0, 0.999999, 0])))

    await vi.advanceTimersByTimeAsync(1500)
    expect(store.performComputerTurn).toHaveBeenCalledTimes(1)
    await vi.advanceTimersByTimeAsync(2199)
    expect(store.performComputerTurn).toHaveBeenCalledTimes(1)
    await vi.advanceTimersByTimeAsync(1)
    expect(store.performComputerTurn).toHaveBeenCalledTimes(2)
    scope.stop()
  })

  it('does not postpone the pending AI timer when the player changes state', async () => {
    const store = createStore({ status: 'playing' })
    const scope = effectScope()
    scope.run(() => useOpponentController(store, () => 0))

    await vi.advanceTimersByTimeAsync(900)
    store.actionRevision += 1
    await vi.advanceTimersByTimeAsync(600)
    expect(store.performComputerTurn).toHaveBeenCalledTimes(1)
    scope.stop()
  })

  it('uses a short randomized recovery after a visible mistake', async () => {
    const store = createStore({
      status: 'playing',
      performComputerTurn: vi
        .fn()
        .mockReturnValueOnce({ performed: true, mistake: true })
        .mockReturnValue({ performed: true, mistake: false })
    })
    const scope = effectScope()
    scope.run(() => useOpponentController(store, () => 0))

    await vi.advanceTimersByTimeAsync(1500)
    expect(store.performComputerTurn).toHaveBeenCalledTimes(1)
    await vi.advanceTimersByTimeAsync(449)
    expect(store.performComputerTurn).toHaveBeenCalledTimes(1)
    await vi.advanceTimersByTimeAsync(1)
    expect(store.performComputerTurn).toHaveBeenCalledTimes(2)
    scope.stop()
  })

  it('cancels while paused or resolving a stall and restarts after play resumes', async () => {
    const store = createStore({ status: 'playing' })
    const scope = effectScope()
    scope.run(() => useOpponentController(store, () => 0))

    await vi.advanceTimersByTimeAsync(700)
    store.status = 'refreshing'
    await vi.advanceTimersByTimeAsync(3000)
    expect(store.performComputerTurn).not.toHaveBeenCalled()
    store.status = 'playing'
    await vi.advanceTimersByTimeAsync(1500)
    expect(store.performComputerTurn).toHaveBeenCalledTimes(1)
    scope.stop()
  })

  it('waits for Guided Practice to finish before starting its slow loop', async () => {
    const store = createStore({ status: 'playing', modeId: 'practice', practiceStage: 'select' })
    const scope = effectScope()
    scope.run(() => useOpponentController(store, () => 0))

    await vi.advanceTimersByTimeAsync(10000)
    expect(store.performComputerTurn).not.toHaveBeenCalled()
    store.practiceStage = 'free'
    await vi.advanceTimersByTimeAsync(2599)
    expect(store.performComputerTurn).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(1)
    expect(store.performComputerTurn).toHaveBeenCalledTimes(1)
    scope.stop()
  })

  it('cannot run an old timer after a new session begins', async () => {
    const store = createStore({ status: 'playing' })
    const scope = effectScope()
    scope.run(() => useOpponentController(store, () => 0))
    await vi.advanceTimersByTimeAsync(900)
    store.sessionId += 1
    await vi.advanceTimersByTimeAsync(600)
    expect(store.performComputerTurn).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(900)
    expect(store.performComputerTurn).toHaveBeenCalledTimes(1)
    scope.stop()
  })
})

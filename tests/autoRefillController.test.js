import { effectScope, reactive } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useAutoRefillController } from '../src/composables/useAutoRefillController.js'

describe('auto-refill controller', () => {
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
      status: 'playing',
      sessionId: 1,
      eventCounter: 0,
      lastEvents: [],
      activeSettings: { autoRefillPlayer: true },
      game: {
        player: { hand: [null, {}, {}, {}, {}], drawPile: [{}] }
      },
      performPlayerAction: vi.fn(() => true),
      ...overrides
    })
  }

  function addEvent(store, event) {
    store.eventCounter += 1
    store.lastEvents = [...store.lastEvents, { ...event, id: store.eventCounter }]
  }

  it('refills a newly emptied slot after 400 ms', async () => {
    const store = createStore()
    const scope = effectScope()
    scope.run(() => useAutoRefillController(store))
    addEvent(store, { type: 'play', actor: 'player', slotIndex: 0 })
    await vi.advanceTimersByTimeAsync(399)
    expect(store.performPlayerAction).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(1)
    expect(store.performPlayerAction).toHaveBeenCalledWith({ type: 'draw', slotIndex: 0, source: 'auto' })
    scope.stop()
  })

  it('cancels when the player fills the slot manually first', async () => {
    const store = createStore()
    const scope = effectScope()
    scope.run(() => useAutoRefillController(store))
    addEvent(store, { type: 'play', actor: 'player', slotIndex: 0 })
    await vi.advanceTimersByTimeAsync(150)
    store.game.player.hand[0] = {}
    addEvent(store, { type: 'draw', actor: 'player', slotIndex: 0 })
    await vi.advanceTimersByTimeAsync(500)
    expect(store.performPlayerAction).not.toHaveBeenCalled()
    scope.stop()
  })

  it('never draws while paused or resolving a stall', async () => {
    const store = createStore()
    const scope = effectScope()
    scope.run(() => useAutoRefillController(store))
    addEvent(store, { type: 'play', actor: 'player', slotIndex: 0 })
    await vi.advanceTimersByTimeAsync(100)
    store.status = 'refreshing'
    await vi.advanceTimersByTimeAsync(500)
    expect(store.performPlayerAction).not.toHaveBeenCalled()
    scope.stop()
  })

  it('cannot apply a stale timer to a new session', async () => {
    const store = createStore()
    const scope = effectScope()
    scope.run(() => useAutoRefillController(store))
    addEvent(store, { type: 'play', actor: 'player', slotIndex: 0 })
    await vi.advanceTimersByTimeAsync(100)
    store.sessionId += 1
    await vi.advanceTimersByTimeAsync(500)
    expect(store.performPlayerAction).not.toHaveBeenCalled()
    scope.stop()
  })

  it('does nothing when the setting is disabled', async () => {
    const store = createStore({ activeSettings: { autoRefillPlayer: false } })
    const scope = effectScope()
    scope.run(() => useAutoRefillController(store))
    addEvent(store, { type: 'play', actor: 'player', slotIndex: 0 })
    await vi.advanceTimersByTimeAsync(500)
    expect(store.performPlayerAction).not.toHaveBeenCalled()
    scope.stop()
  })
})

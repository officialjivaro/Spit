import { createPinia, setActivePinia } from 'pinia'
import { effectScope } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useOpponentController } from '../src/composables/useOpponentController.js'
import { createStandardDeck } from '../src/game/cards.js'
import { useGameStore } from '../src/stores/game.js'

const deck = createStandardDeck()
const card = (rank, suit = 'clubs') => deck.find((item) => item.rank === rank && item.suit === suit)

describe('computer opponent integration', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    setActivePinia(createPinia())
  })

  afterEach(() => vi.useRealTimers())

  function prepareStore() {
    const store = useGameStore()
    store.status = 'playing'
    store.sessionId = 7
    store.difficultyId = 'easy'
    store.modeId = 'quick'
    store.activeSettings.allowAiMistakes = false
    store.game = {
      player: {
        hand: [card(7, 'clubs'), card(4, 'clubs'), null, null, null],
        drawPile: [card(3, 'spades')]
      },
      computer: {
        hand: [card(2, 'hearts'), card(4, 'hearts'), card(6, 'hearts'), card(10, 'hearts'), card(12, 'hearts')],
        drawPile: [card(11, 'spades')]
      },
      centerPiles: [[card(1, 'spades')], [card(8, 'diamonds')]],
      reservePiles: [[], []],
      outcome: null,
      revision: 0,
      stallCycleCount: 0
    }
    return store
  }

  it('plays a legal card and refills the empty slot on a later cycle', async () => {
    const store = prepareStore()
    const initialRemaining = store.computerRemaining
    const scope = effectScope()
    scope.run(() => useOpponentController(store, () => 0, () => 0))

    await vi.advanceTimersByTimeAsync(1500)
    expect(store.computerRemaining).toBe(initialRemaining - 1)
    expect(store.game.centerPiles[0].at(-1)).toMatchObject({ rank: 2, suit: 'hearts' })
    expect(store.game.computer.hand[0]).toBeNull()

    await vi.advanceTimersByTimeAsync(1500)
    expect(store.game.computer.hand[0]).toMatchObject({ rank: 11, suit: 'spades' })
    expect(store.game.computer.drawPile).toHaveLength(0)
    scope.stop()
  })

  it('records a mistake event without changing any card location or revision', () => {
    const store = prepareStore()
    store.activeSettings.allowAiMistakes = true
    const before = JSON.stringify(store.game)
    const revision = store.game.revision
    const result = store.performComputerTurn(() => 0)
    expect(result.mistake).toBe(true)
    expect(JSON.stringify(store.game)).toBe(before)
    expect(store.game.revision).toBe(revision)
    expect(store.lastEvents.at(-1)).toMatchObject({ type: 'ai-mistake', actor: 'computer' })
  })
})

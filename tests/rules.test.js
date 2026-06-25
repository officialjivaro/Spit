import { describe, expect, it } from 'vitest'
import { createStandardDeck } from '../src/game/cards.js'
import {
  canPlayCard,
  getIllegalPlayAttempts,
  getLegalPileIndices,
  getLegalPlayActions,
  getLegalSlotIndices,
  getRefillActions,
  isAdjacentRank,
  isDeadlocked
} from '../src/game/rules.js'

const deck = createStandardDeck()
const card = (rank, suit = 'clubs') => deck.find((item) => item.rank === rank && item.suit === suit)

function baseState() {
  return {
    player: { hand: [card(2), null, card(7), null, null], drawPile: [card(9)] },
    computer: { hand: [card(5), null, null, null, null], drawPile: [] },
    centerPiles: [[card(1, 'hearts')], [card(8, 'spades')]],
    reservePiles: [[], []],
    outcome: null,
    revision: 0,
    stallCycleCount: 0
  }
}

describe('rank adjacency', () => {
  it('accepts one rank higher or lower', () => {
    expect(isAdjacentRank(5, 4)).toBe(true)
    expect(isAdjacentRank(5, 6)).toBe(true)
  })

  it('wraps Ace to both 2 and King', () => {
    expect(isAdjacentRank(1, 2)).toBe(true)
    expect(isAdjacentRank(2, 1)).toBe(true)
    expect(isAdjacentRank(1, 13)).toBe(true)
    expect(isAdjacentRank(13, 1)).toBe(true)
  })

  it('rejects equal and non-adjacent ranks while ignoring suit', () => {
    expect(isAdjacentRank(6, 6)).toBe(false)
    expect(isAdjacentRank(3, 8)).toBe(false)
    expect(canPlayCard(card(2, 'clubs'), card(1, 'hearts'))).toBe(true)
  })
})

describe('available actions and hints', () => {
  it('finds legal destinations and unique legal slots', () => {
    const game = baseState()
    expect(getLegalPlayActions(game, 'player')).toEqual(
      expect.arrayContaining([
        { type: 'play', actor: 'player', slotIndex: 0, pileIndex: 0 },
        { type: 'play', actor: 'player', slotIndex: 2, pileIndex: 1 }
      ])
    )
    expect(getLegalSlotIndices(game, 'player')).toEqual([0, 2])
    expect(getLegalPileIndices(game, 'player', 2)).toEqual([1])
  })

  it('offers refill actions only for empty slots with cards remaining', () => {
    const game = baseState()
    expect(getRefillActions(game, 'player')).toHaveLength(3)
    expect(getRefillActions(game, 'computer')).toHaveLength(0)
  })

  it('finds believable illegal targets for AI mistake animations', () => {
    const attempts = getIllegalPlayAttempts(baseState(), 'computer')
    expect(attempts.length).toBeGreaterThan(0)
    for (const attempt of attempts) {
      const game = baseState()
      const source = game.computer.hand[attempt.slotIndex]
      const top = game.centerPiles[attempt.pileIndex].at(-1)
      expect(canPlayCard(source, top)).toBe(false)
    }
  })
})

describe('deadlock detection', () => {
  it('does not deadlock while a refill remains available', () => {
    const game = baseState()
    game.player.hand = [card(4), null, card(6), card(10), card(12)]
    game.centerPiles = [[card(8)], [card(8, 'hearts')]]
    expect(isDeadlocked(game)).toBe(false)
  })

  it('does not deadlock while either participant has a legal play', () => {
    const game = baseState()
    game.player.drawPile = []
    game.player.hand = [card(2), card(4), card(6), card(10), card(12)]
    expect(isDeadlocked(game)).toBe(false)
  })

  it('detects a true block only when no play or refill exists', () => {
    const game = baseState()
    game.player = { hand: [card(4), card(4, 'hearts'), card(6), card(10), card(12)], drawPile: [] }
    game.computer = { hand: [card(4, 'diamonds'), card(6, 'hearts'), card(10, 'hearts'), card(12, 'hearts'), card(4, 'spades')], drawPile: [] }
    game.centerPiles = [[card(8)], [card(8, 'hearts')]]
    expect(isDeadlocked(game)).toBe(true)
  })
})

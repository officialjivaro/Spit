import { describe, expect, it } from 'vitest'
import { createStandardDeck } from '../src/game/cards.js'
import {
  applyGameAction,
  countCardsInGame,
  createInitialGame,
  resolveStallPair
} from '../src/game/engine.js'
import { getLegalPlayActions } from '../src/game/rules.js'

const deck = createStandardDeck()
const card = (rank, suit = 'clubs') => deck.find((item) => item.rank === rank && item.suit === suit)

function state(overrides = {}) {
  return {
    player: { hand: [card(2), card(4), card(6), card(8), card(10)], drawPile: [] },
    computer: { hand: [card(3, 'hearts'), card(5, 'hearts'), card(7, 'hearts'), card(9, 'hearts'), card(11, 'hearts')], drawPile: [] },
    centerPiles: [[card(12, 'spades')], [card(13, 'diamonds')]],
    reservePiles: [[], []],
    outcome: null,
    revision: 0,
    stallCycleCount: 0,
    ...overrides
  }
}

describe('initial deal', () => {
  it('accounts for all 52 unique cards and named reserves', () => {
    const game = createInitialGame(() => 0.42)
    const cards = countCardsInGame(game)
    expect(cards).toHaveLength(52)
    expect(new Set(cards.map((item) => item.id)).size).toBe(52)
    expect(game.player.hand).toHaveLength(5)
    expect(game.player.drawPile).toHaveLength(15)
    expect(game.computer.hand).toHaveLength(5)
    expect(game.computer.drawPile).toHaveLength(15)
    expect(game.reservePiles.map((pile) => pile.length)).toEqual([5, 5])
  })

  it('can prepare Guided Practice with at least one legal opening move', () => {
    const game = createInitialGame(() => 0.42, { ensurePlayerMove: true })
    expect(getLegalPlayActions(game, 'player').length).toBeGreaterThan(0)
    expect(countCardsInGame(game)).toHaveLength(52)
  })
})

describe('game actions', () => {
  it('draws one card into an empty slot', () => {
    const drawCard = card(9, 'spades')
    const game = state({
      player: { hand: [card(2), null, card(6), card(8), card(10)], drawPile: [drawCard] },
      centerPiles: [[card(1, 'hearts')], [card(12, 'diamonds')]]
    })
    const result = applyGameAction(game, { type: 'draw', actor: 'player', slotIndex: 1 })
    expect(result.valid).toBe(true)
    expect(result.state.player.hand[1]).toEqual(drawCard)
    expect(result.events[0]).toMatchObject({ type: 'draw', actor: 'player', slotIndex: 1 })
  })

  it('rejects an illegal rank without changing state', () => {
    const game = state()
    const result = applyGameAction(game, { type: 'play', actor: 'player', slotIndex: 0, pileIndex: 0 })
    expect(result.valid).toBe(false)
    expect(result.reason).toBe('illegal-rank')
    expect(result.state).toBe(game)
  })

  it('finishes when the player empties the final card', () => {
    const game = state({
      player: { hand: [card(2), null, null, null, null], drawPile: [] },
      computer: { hand: [card(9, 'hearts'), null, null, null, null], drawPile: [] },
      centerPiles: [[card(1, 'spades')], [card(7, 'diamonds')]]
    })
    const result = applyGameAction(game, { type: 'play', actor: 'player', slotIndex: 0, pileIndex: 0 })
    expect(result.state.outcome).toEqual({ winner: 'player', reason: 'emptied-cards' })
  })

  it('reports a deadlock without silently revealing reserve cards', () => {
    const game = state({
      player: { hand: [card(7), card(7, 'spades'), card(9), card(9, 'diamonds'), card(11)], drawPile: [] },
      computer: { hand: [card(7, 'hearts'), card(9, 'hearts'), card(11, 'hearts'), card(7, 'diamonds'), null], drawPile: [card(12, 'spades')] },
      centerPiles: [[card(1)], [card(3)]],
      reservePiles: [[card(5)], [card(6)]]
    })
    const result = applyGameAction(game, { type: 'draw', actor: 'computer', slotIndex: 4 })
    expect(result.valid).toBe(true)
    expect(result.deadlocked).toBe(true)
    expect(result.events.some((event) => event.type === 'reserve-reveal')).toBe(false)
    expect(result.state.reservePiles.map((pile) => pile.length)).toEqual([1, 1])
  })
})

describe('visible stall resolution', () => {
  it('moves the player reserve to left and computer reserve to right simultaneously', () => {
    const left = card(1, 'hearts')
    const right = card(12, 'clubs')
    const game = state({
      player: { hand: [card(4), card(6), card(10), card(12), card(4, 'spades')], drawPile: [] },
      computer: { hand: [card(4, 'hearts'), card(6, 'hearts'), card(10, 'hearts'), card(12, 'hearts'), card(4, 'diamonds')], drawPile: [] },
      centerPiles: [[card(8, 'spades')], [card(8, 'diamonds')]],
      reservePiles: [[left], [right]]
    })
    const result = resolveStallPair(game, () => 0.99)
    expect(result.resolved).toBe(true)
    expect(result.events).toContainEqual(expect.objectContaining({ type: 'reserve-reveal', cardIds: [left.id, right.id] }))
    expect(result.state.centerPiles[0].at(-1)).toEqual(left)
    expect(result.state.centerPiles[1].at(-1)).toEqual(right)
  })

  it('refuses to resolve when the table is not actually deadlocked', () => {
    const game = state()
    expect(resolveStallPair(game).reason).toBe('not-deadlocked')
  })

  it('recycles buried cards and preserves both visible tops', () => {
    const leftTop = card(8, 'spades')
    const rightTop = card(8, 'diamonds')
    const game = state({
      player: { hand: [card(4), card(4, 'hearts'), card(6), card(10), card(12)], drawPile: [] },
      computer: { hand: [card(4, 'diamonds'), card(6, 'hearts'), card(10, 'hearts'), card(12, 'hearts'), card(4, 'spades')], drawPile: [] },
      centerPiles: [[card(1, 'hearts'), leftTop], [card(2, 'clubs'), rightTop]],
      reservePiles: [[], []]
    })
    const beforeIds = countCardsInGame(game).map((item) => item.id).sort()
    const result = resolveStallPair(game, () => 0.99)
    expect(result.events.map((event) => event.type)).toEqual(['recycle', 'reserve-reveal'])
    expect(result.state.centerPiles[0][0]).toEqual(leftTop)
    expect(result.state.centerPiles[1][0]).toEqual(rightTop)
    expect(countCardsInGame(result.state).map((item) => item.id).sort()).toEqual(beforeIds)
  })

  it('declares a draw when no reserve or buried cards remain', () => {
    const game = state({
      player: { hand: [card(4), card(4, 'hearts'), card(6), card(10), card(12)], drawPile: [] },
      computer: { hand: [card(4, 'diamonds'), card(6, 'hearts'), card(10, 'hearts'), card(12, 'hearts'), card(4, 'spades')], drawPile: [] },
      centerPiles: [[card(8, 'spades')], [card(8, 'diamonds')]],
      reservePiles: [[], []]
    })
    const result = resolveStallPair(game)
    expect(result.state.outcome).toEqual({ winner: 'draw', reason: 'no-reserve-cards' })
  })

  it('stops an unrecoverable repeated cycle at the safety limit', () => {
    const game = state({
      player: { hand: [card(4), card(4, 'hearts'), card(6), card(10), card(12)], drawPile: [] },
      computer: { hand: [card(4, 'diamonds'), card(6, 'hearts'), card(10, 'hearts'), card(12, 'hearts'), card(4, 'spades')], drawPile: [] },
      centerPiles: [[card(8, 'spades')], [card(8, 'diamonds')]],
      reservePiles: [[card(1)], [card(2)]],
      stallCycleCount: 60
    })
    expect(resolveStallPair(game).state.outcome).toEqual({ winner: 'draw', reason: 'safety-stop' })
  })
})

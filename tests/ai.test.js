import { describe, expect, it } from 'vitest'
import { createStandardDeck } from '../src/game/cards.js'
import { chooseComputerAction, chooseComputerDecision } from '../src/game/ai.js'
import { canPlayCard, getAvailableActions } from '../src/game/rules.js'

const deck = createStandardDeck()
const card = (rank, suit = 'clubs') => deck.find((item) => item.rank === rank && item.suit === suit)

function gameState() {
  return {
    player: { hand: [card(9), null, null, null, null], drawPile: [] },
    computer: { hand: [card(2, 'hearts'), card(7, 'hearts'), null, null, null], drawPile: [card(11, 'spades')] },
    centerPiles: [[card(1, 'spades')], [card(8, 'diamonds')]],
    reservePiles: [[], []],
    outcome: null,
    revision: 0,
    stallCycleCount: 0
  }
}

function sequence(values) {
  let index = 0
  return () => values[Math.min(index++, values.length - 1)]
}

describe('legal computer actions', () => {
  it('always returns one of the legal actions', () => {
    const game = gameState()
    const legal = getAvailableActions(game, 'computer')
    for (const randomValue of [0, 0.25, 0.75, 0.999]) {
      expect(legal).toContainEqual(chooseComputerAction(game, () => randomValue))
    }
  })

  it('prefers a play over refilling an empty slot', () => {
    expect(chooseComputerAction(gameState(), () => 0.5).type).toBe('play')
  })

  it('refills when no legal play exists', () => {
    const game = gameState()
    game.computer.hand = [card(4, 'hearts'), null, null, null, null]
    game.centerPiles = [[card(8, 'spades')], [card(10, 'diamonds')]]
    expect(chooseComputerAction(game, () => 0)).toEqual({
      type: 'draw', actor: 'computer', slotIndex: 1
    })
  })
})

describe('intentional AI mistakes', () => {
  it('creates a harmless mistake when the probability roll is inside the rate', () => {
    const game = gameState()
    const decision = chooseComputerDecision(game, {
      random: sequence([0.01, 0]),
      mistakeRate: 0.12,
      allowMistakes: true
    })
    expect(decision.kind).toBe('mistake')
    const source = game.computer.hand[decision.attempt.slotIndex]
    const top = game.centerPiles[decision.attempt.pileIndex].at(-1)
    expect(canPlayCard(source, top)).toBe(false)
  })

  it('chooses a legal action when the probability roll misses the rate', () => {
    const decision = chooseComputerDecision(gameState(), {
      random: sequence([0.13, 0]),
      mistakeRate: 0.12,
      allowMistakes: true
    })
    expect(decision.kind).toBe('action')
  })

  it('cannot make two intentional mistakes consecutively', () => {
    const decision = chooseComputerDecision(gameState(), {
      random: () => 0,
      mistakeRate: 1,
      allowMistakes: true,
      lastWasMistake: true
    })
    expect(decision.kind).toBe('action')
  })


  it('does not invent a mistake when the computer has no available action', () => {
    const game = gameState()
    game.computer.hand = [card(4, 'hearts'), card(5, 'hearts'), card(6, 'hearts'), card(10, 'hearts'), card(12, 'hearts')]
    game.computer.drawPile = []
    game.centerPiles = [[card(8, 'spades')], [card(1, 'diamonds')]]

    const decision = chooseComputerDecision(game, {
      random: () => 0,
      mistakeRate: 1,
      allowMistakes: true
    })

    expect(decision.kind).toBe('none')
  })

  it('never makes a mistake when the setting is disabled', () => {
    const decision = chooseComputerDecision(gameState(), {
      random: () => 0,
      mistakeRate: 1,
      allowMistakes: false
    })
    expect(decision.kind).toBe('action')
  })
})

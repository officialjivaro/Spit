import { dealStandardGame, shuffleCards } from './deck.js'
import {
  ACTORS,
  canPlayCard,
  getLegalPlayActions,
  getTopCard,
  isDeadlocked,
  participantHasFinished
} from './rules.js'

// Game Engine | Applies immutable actions and resolves one visible reserve pair at a time
export function createInitialGame(random = Math.random, options = {}) {
  const dealt = dealStandardGame(random)
  const game = {
    ...dealt,
    outcome: null,
    revision: 0,
    stallCycleCount: 0
  }

  if (options.ensurePlayerMove) ensurePlayerOpeningMove(game)
  return game
}

function ensurePlayerOpeningMove(state) {
  if (getLegalPlayActions(state, 'player').length > 0) return state

  const containers = [
    state.player.drawPile,
    state.computer.hand,
    state.computer.drawPile,
    ...state.reservePiles
  ]

  for (const container of containers) {
    const index = container.findIndex((card) =>
      state.centerPiles.some((pile) => canPlayCard(card, getTopCard(pile)))
    )
    if (index < 0) continue

    const replacement = state.player.hand[0]
    state.player.hand[0] = container[index]
    container[index] = replacement
    return state
  }

  return state
}

export function cloneGameState(state) {
  const reservePiles = state.reservePiles || [[], []]
  return {
    player: {
      hand: [...state.player.hand],
      drawPile: [...state.player.drawPile]
    },
    computer: {
      hand: [...state.computer.hand],
      drawPile: [...state.computer.drawPile]
    },
    centerPiles: state.centerPiles.map((pile) => [...pile]),
    reservePiles: reservePiles.map((pile) => [...pile]),
    outcome: state.outcome ? { ...state.outcome } : null,
    revision: state.revision || 0,
    stallCycleCount: state.stallCycleCount || 0
  }
}

function invalidResult(state, action, reason) {
  return {
    valid: false,
    reason,
    state,
    events: [
      {
        type: 'invalid',
        actor: action?.actor || 'player',
        actionType: action?.type || 'unknown',
        slotIndex: Number.isInteger(action?.slotIndex) ? action.slotIndex : null,
        pileIndex: Number.isInteger(action?.pileIndex) ? action.pileIndex : null,
        reason
      }
    ]
  }
}

function determineWinner(state) {
  const playerFinished = participantHasFinished(state.player)
  const computerFinished = participantHasFinished(state.computer)
  if (playerFinished && computerFinished) return 'draw'
  if (playerFinished) return 'player'
  if (computerFinished) return 'computer'
  return null
}

function markOutcome(state, winner, reason) {
  state.outcome = { winner, reason }
  state.revision += 1
}

export function evaluateGameState(state) {
  const next = cloneGameState(state)
  const events = []
  const winner = determineWinner(next)

  if (winner && !next.outcome) {
    markOutcome(next, winner, 'emptied-cards')
    events.push({ type: 'finish', winner, reason: 'emptied-cards' })
  }

  return { state: next, events, deadlocked: isDeadlocked(next) }
}

export function applyGameAction(state, action) {
  if (!state || state.outcome) return invalidResult(state, action, 'game-finished')
  if (!action || !ACTORS.includes(action.actor)) return invalidResult(state, action, 'invalid-actor')
  if (!Number.isInteger(action.slotIndex) || action.slotIndex < 0 || action.slotIndex > 4) {
    return invalidResult(state, action, 'invalid-slot')
  }

  const next = cloneGameState(state)
  const participant = next[action.actor]
  const events = []

  if (action.type === 'play') {
    if (!Number.isInteger(action.pileIndex) || action.pileIndex < 0 || action.pileIndex > 1) {
      return invalidResult(state, action, 'invalid-pile')
    }

    const card = participant.hand[action.slotIndex]
    const topCard = getTopCard(next.centerPiles[action.pileIndex])
    if (!card) return invalidResult(state, action, 'empty-slot')
    if (!canPlayCard(card, topCard)) return invalidResult(state, action, 'illegal-rank')

    participant.hand[action.slotIndex] = null
    next.centerPiles[action.pileIndex].push(card)
    next.revision += 1
    next.stallCycleCount = 0
    events.push({
      type: 'play',
      actor: action.actor,
      cardId: card.id,
      slotIndex: action.slotIndex,
      pileIndex: action.pileIndex
    })
  } else if (action.type === 'draw') {
    if (participant.hand[action.slotIndex]) return invalidResult(state, action, 'slot-occupied')
    if (participant.drawPile.length === 0) return invalidResult(state, action, 'draw-pile-empty')

    const card = participant.drawPile.pop()
    participant.hand[action.slotIndex] = card
    next.revision += 1
    next.stallCycleCount = 0
    events.push({
      type: 'draw',
      actor: action.actor,
      cardId: card.id,
      slotIndex: action.slotIndex,
      source: action.source || 'manual'
    })
  } else {
    return invalidResult(state, action, 'unknown-action')
  }

  const evaluated = evaluateGameState(next)
  return {
    valid: true,
    reason: null,
    state: evaluated.state,
    events: [...events, ...evaluated.events],
    deadlocked: evaluated.deadlocked
  }
}

function recycleReserveCards(state, random) {
  const centerTops = state.centerPiles.map((pile) => getTopCard(pile))
  const recyclableCards = [
    ...state.reservePiles[0],
    ...state.reservePiles[1],
    ...state.centerPiles[0].slice(0, -1),
    ...state.centerPiles[1].slice(0, -1)
  ]

  if (centerTops.some((card) => !card) || recyclableCards.length < 2) return null

  const shuffled = shuffleCards(recyclableCards, random)
  state.centerPiles = centerTops.map((card) => [card])
  state.reservePiles = [[], []]
  shuffled.forEach((card, index) => state.reservePiles[index % 2].push(card))
  state.revision += 1
  return { type: 'recycle', count: shuffled.length }
}

export function resolveStallPair(state, random = Math.random) {
  if (!state || state.outcome) {
    return { resolved: false, reason: 'game-finished', state, events: [] }
  }
  if (!isDeadlocked(state)) {
    return { resolved: false, reason: 'not-deadlocked', state, events: [] }
  }

  const next = cloneGameState(state)
  const events = []

  if (next.stallCycleCount >= 60) {
    markOutcome(next, 'draw', 'safety-stop')
    events.push({ type: 'finish', winner: 'draw', reason: 'safety-stop' })
    return { resolved: true, reason: 'draw', state: next, events, deadlocked: false }
  }

  if (!next.reservePiles.every((pile) => pile.length > 0)) {
    const recycleEvent = recycleReserveCards(next, random)
    if (!recycleEvent) {
      markOutcome(next, 'draw', 'no-reserve-cards')
      events.push({ type: 'finish', winner: 'draw', reason: 'no-reserve-cards' })
      return { resolved: true, reason: 'draw', state: next, events, deadlocked: false }
    }
    events.push(recycleEvent)
  }

  if (!next.reservePiles.every((pile) => pile.length > 0)) {
    markOutcome(next, 'draw', 'unresolved-stall')
    events.push({ type: 'finish', winner: 'draw', reason: 'unresolved-stall' })
    return { resolved: true, reason: 'draw', state: next, events, deadlocked: false }
  }

  const revealedCards = next.reservePiles.map((pile, pileIndex) => {
    const card = pile.pop()
    next.centerPiles[pileIndex].push(card)
    return card
  })
  next.revision += 1
  next.stallCycleCount += 1
  events.push({
    type: 'reserve-reveal',
    cardIds: revealedCards.map((card) => card.id),
    pileIndices: [0, 1]
  })

  return {
    resolved: true,
    reason: null,
    state: next,
    events,
    deadlocked: isDeadlocked(next)
  }
}

export function countCardsInGame(state) {
  const reservePiles = state.reservePiles || [[], []]
  return [
    ...state.player.hand.filter(Boolean),
    ...state.player.drawPile,
    ...state.computer.hand.filter(Boolean),
    ...state.computer.drawPile,
    ...state.centerPiles.flat(),
    ...reservePiles.flat()
  ]
}

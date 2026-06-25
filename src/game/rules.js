// Game Rules | Keeps validation, hints, mistakes, and deadlocks independent of Vue
export const ACTORS = ['player', 'computer']

export function isAdjacentRank(firstRank, secondRank) {
  const difference = Math.abs(firstRank - secondRank)
  return difference === 1 || difference === 12
}

export function canPlayCard(card, topCard) {
  return Boolean(card && topCard && isAdjacentRank(card.rank, topCard.rank))
}

export function getTopCard(pile) {
  return pile?.[pile.length - 1] || null
}

export function getLegalPlayActions(state, actor) {
  if (!state || !ACTORS.includes(actor)) return []
  const actions = []

  state[actor].hand.forEach((card, slotIndex) => {
    if (!card) return
    state.centerPiles.forEach((pile, pileIndex) => {
      if (canPlayCard(card, getTopCard(pile))) {
        actions.push({ type: 'play', actor, slotIndex, pileIndex })
      }
    })
  })

  return actions
}

export function getIllegalPlayAttempts(state, actor) {
  if (!state || !ACTORS.includes(actor)) return []
  const attempts = []

  state[actor].hand.forEach((card, slotIndex) => {
    if (!card) return
    state.centerPiles.forEach((pile, pileIndex) => {
      if (!canPlayCard(card, getTopCard(pile))) {
        attempts.push({
          type: 'mistake',
          actor,
          slotIndex,
          pileIndex,
          cardId: card.id
        })
      }
    })
  })

  return attempts
}

export function getRefillActions(state, actor) {
  if (!state || !ACTORS.includes(actor) || state[actor].drawPile.length === 0) return []

  return state[actor].hand.flatMap((card, slotIndex) =>
    card ? [] : [{ type: 'draw', actor, slotIndex }]
  )
}

export function getAvailableActions(state, actor) {
  return [...getLegalPlayActions(state, actor), ...getRefillActions(state, actor)]
}

export function getLegalSlotIndices(state, actor = 'player') {
  return [...new Set(getLegalPlayActions(state, actor).map(({ slotIndex }) => slotIndex))]
}

export function getLegalPileIndices(state, actor, slotIndex) {
  return getLegalPlayActions(state, actor)
    .filter((action) => action.slotIndex === slotIndex)
    .map((action) => action.pileIndex)
}

export function hasAnyAvailableAction(state) {
  return ACTORS.some((actor) => getAvailableActions(state, actor).length > 0)
}

export function isDeadlocked(state) {
  return Boolean(state && !state.outcome && !hasAnyAvailableAction(state))
}

export function participantHasFinished(participant) {
  return participant.drawPile.length === 0 && participant.hand.every((card) => card === null)
}

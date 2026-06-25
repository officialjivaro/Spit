import {
  getIllegalPlayAttempts,
  getLegalPlayActions,
  getRefillActions
} from './rules.js'

// Computer Opponent | Selects legal actions or harmless intentional mistakes
function safeRandom(random) {
  return Math.min(Math.max(Number(random()) || 0, 0), 0.999999999)
}

function chooseRandom(items, random) {
  if (items.length === 0) return null
  return items[Math.floor(safeRandom(random) * items.length)]
}

export function chooseComputerAction(state, random = Math.random) {
  const legalPlays = getLegalPlayActions(state, 'computer')
  if (legalPlays.length > 0) return chooseRandom(legalPlays, random)
  return chooseRandom(getRefillActions(state, 'computer'), random)
}

export function chooseComputerDecision(
  state,
  {
    random = Math.random,
    allowMistakes = true,
    mistakeRate = 0,
    lastWasMistake = false
  } = {}
) {
  const legalPlays = getLegalPlayActions(state, 'computer')
  const availableActions = legalPlays.length > 0
    ? legalPlays
    : getRefillActions(state, 'computer')
  if (availableActions.length === 0) return { kind: 'none' }

  const mistakes = getIllegalPlayAttempts(state, 'computer')
  const canMistake =
    allowMistakes &&
    !lastWasMistake &&
    mistakeRate > 0 &&
    mistakes.length > 0

  if (canMistake && safeRandom(random) < mistakeRate) {
    return {
      kind: 'mistake',
      attempt: chooseRandom(mistakes, random)
    }
  }

  return { kind: 'action', action: chooseRandom(availableActions, random) }
}

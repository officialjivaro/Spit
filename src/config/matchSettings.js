// Match Settings | Defines safe preferences and Standard, Custom, and Practice rules
export const MATCH_SETTING_DEFINITIONS = [
  {
    id: 'showOpponentCards',
    name: 'Show opponent cards',
    description: 'Reveal the computer hand during the match.'
  },
  {
    id: 'allowAiMistakes',
    name: 'Allow AI mistakes',
    description: 'Let the opponent occasionally attempt an invalid play.'
  },
  {
    id: 'highlightLegalMoves',
    name: 'Highlight legal moves',
    description: 'Mark playable cards and valid destination piles.'
  },
  {
    id: 'autoRefillPlayer',
    name: 'Auto-refill empty slots',
    description: 'Refill a newly emptied slot after a short delay.'
  }
]

export const STANDARD_MATCH_SETTINGS = Object.freeze({
  showOpponentCards: false,
  allowAiMistakes: true,
  highlightLegalMoves: false,
  autoRefillPlayer: false
})

export const PRACTICE_MATCH_SETTINGS = Object.freeze({
  showOpponentCards: true,
  allowAiMistakes: false,
  highlightLegalMoves: true,
  autoRefillPlayer: false
})

export function createDefaultMatchSettings() {
  return { ...STANDARD_MATCH_SETTINGS }
}

export function sanitizeMatchSettings(value) {
  const source = value && typeof value === 'object' ? value : {}
  return MATCH_SETTING_DEFINITIONS.reduce((settings, definition) => {
    const fallback = STANDARD_MATCH_SETTINGS[definition.id]
    settings[definition.id] =
      typeof source[definition.id] === 'boolean' ? source[definition.id] : fallback
    return settings
  }, {})
}

export function settingsForMode(modeId, preferences) {
  if (modeId === 'practice') return { ...PRACTICE_MATCH_SETTINGS }
  return sanitizeMatchSettings(preferences)
}

export function isStandardSettings(settings) {
  return MATCH_SETTING_DEFINITIONS.every(
    ({ id }) => Boolean(settings?.[id]) === STANDARD_MATCH_SETTINGS[id]
  )
}

export function classifyMatch(modeId, settings) {
  if (modeId === 'practice') return 'practice'
  return isStandardSettings(settings) ? 'standard' : 'custom'
}

export function matchClassificationLabel(classification) {
  if (classification === 'practice') return 'Practice'
  if (classification === 'custom') return 'Custom'
  return 'Standard'
}

export function activeSettingLabels(settings) {
  return MATCH_SETTING_DEFINITIONS.filter(({ id }) => Boolean(settings?.[id])).map(
    ({ name }) => name
  )
}

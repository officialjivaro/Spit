import { describe, expect, it } from 'vitest'
import {
  PRACTICE_MATCH_SETTINGS,
  STANDARD_MATCH_SETTINGS,
  classifyMatch,
  createDefaultMatchSettings,
  sanitizeMatchSettings,
  settingsForMode
} from '../src/config/matchSettings.js'

describe('match settings', () => {
  it('creates the agreed Standard defaults', () => {
    expect(createDefaultMatchSettings()).toEqual(STANDARD_MATCH_SETTINGS)
    expect(classifyMatch('quick', STANDARD_MATCH_SETTINGS)).toBe('standard')
  })

  it('labels any changed Quick Game setting as Custom', () => {
    for (const key of Object.keys(STANDARD_MATCH_SETTINGS)) {
      expect(classifyMatch('quick', {
        ...STANDARD_MATCH_SETTINGS,
        [key]: !STANDARD_MATCH_SETTINGS[key]
      })).toBe('custom')
    }
  })

  it('forces Guided Practice settings without changing preferences', () => {
    const preferences = { ...STANDARD_MATCH_SETTINGS, autoRefillPlayer: true }
    expect(settingsForMode('practice', preferences)).toEqual(PRACTICE_MATCH_SETTINGS)
    expect(preferences.autoRefillPlayer).toBe(true)
    expect(classifyMatch('practice', PRACTICE_MATCH_SETTINGS)).toBe('practice')
  })

  it('sanitizes malformed values back to defaults', () => {
    expect(sanitizeMatchSettings({ showOpponentCards: 'yes', allowAiMistakes: false })).toEqual({
      ...STANDARD_MATCH_SETTINGS,
      allowAiMistakes: false
    })
  })
})

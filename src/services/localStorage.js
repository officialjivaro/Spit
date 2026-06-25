import { DEFAULT_DIFFICULTY_ID, DIFFICULTIES } from '../config/gameOptions.js'
import {
  createDefaultMatchSettings,
  sanitizeMatchSettings
} from '../config/matchSettings.js'
import {
  createDefaultStatistics,
  migrateLegacyStatistics,
  sanitizeStatistics
} from './statistics.js'

// Local Persistence | Migrates v1 totals into Legacy and stores v2 preferences safely
export const STORAGE_KEY = 'speedgame:v2'
export const LEGACY_STORAGE_KEY = 'speedgame:v1'

function defaultPayload() {
  return {
    settings: {
      difficultyId: DEFAULT_DIFFICULTY_ID,
      matchSettings: createDefaultMatchSettings()
    },
    statistics: createDefaultStatistics()
  }
}

function sanitizeDifficulty(value) {
  return DIFFICULTIES.some(({ id }) => id === value) ? value : DEFAULT_DIFFICULTY_ID
}

function sanitizePayload(value) {
  const defaults = defaultPayload()
  if (!value || typeof value !== 'object') return defaults

  return {
    settings: {
      difficultyId: sanitizeDifficulty(value.settings?.difficultyId),
      matchSettings: sanitizeMatchSettings(value.settings?.matchSettings)
    },
    statistics: sanitizeStatistics(value.statistics)
  }
}

export function migrateV1Payload(value) {
  const defaults = defaultPayload()
  if (!value || typeof value !== 'object') return defaults

  return {
    settings: {
      difficultyId: sanitizeDifficulty(value.settings?.difficultyId),
      matchSettings: createDefaultMatchSettings()
    },
    statistics: migrateLegacyStatistics(value.stats)
  }
}

function parseStoredValue(storage, key, transform) {
  const raw = storage.getItem(key)
  if (!raw) return null

  try {
    return transform(JSON.parse(raw))
  } catch {
    return null
  }
}

export function loadLocalData() {
  const defaults = defaultPayload()
  if (typeof window === 'undefined') return defaults

  try {
    const storage = window.localStorage
    const current = parseStoredValue(storage, STORAGE_KEY, sanitizePayload)
    if (current) return current

    return parseStoredValue(storage, LEGACY_STORAGE_KEY, migrateV1Payload) || defaults
  } catch {
    return defaults
  }
}

export function saveLocalData(payload) {
  if (typeof window === 'undefined') return false

  try {
    const sanitized = sanitizePayload(payload)
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: 2,
        settings: sanitized.settings,
        statistics: sanitized.statistics
      })
    )
    return true
  } catch {
    return false
  }
}

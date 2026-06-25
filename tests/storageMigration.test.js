import { afterEach, describe, expect, it } from 'vitest'
import {
  LEGACY_STORAGE_KEY,
  STORAGE_KEY,
  loadLocalData,
  migrateV1Payload,
  saveLocalData
} from '../src/services/localStorage.js'
import { createDefaultStatistics } from '../src/services/statistics.js'

function createStorage() {
  const values = new Map()
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key),
    values
  }
}

const originalWindow = globalThis.window

afterEach(() => {
  if (originalWindow === undefined) delete globalThis.window
  else globalThis.window = originalWindow
})

describe('v1 to v2 persistence migration', () => {
  it('preserves old totals under a read-only Legacy category', () => {
    const migrated = migrateV1Payload({
      settings: { difficultyId: 'hard' },
      stats: { gamesPlayed: 9, wins: 5, losses: 3, draws: 1, bestWinMs: 32100 }
    })
    expect(migrated.settings.difficultyId).toBe('hard')
    expect(migrated.statistics.legacy).toMatchObject({ gamesPlayed: 9, wins: 5, bestWinMs: 32100 })
    expect(migrated.statistics.standard.gamesPlayed).toBe(0)
    expect(migrated.statistics.custom.gamesPlayed).toBe(0)
  })

  it('loads the legacy key when no v2 payload exists', () => {
    const localStorage = createStorage()
    localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify({
      settings: { difficultyId: 'easy' },
      stats: { gamesPlayed: 2, wins: 1 }
    }))
    globalThis.window = { localStorage }
    const loaded = loadLocalData()
    expect(loaded.settings.difficultyId).toBe('easy')
    expect(loaded.statistics.legacy.gamesPlayed).toBe(2)
  })

  it('falls back to valid legacy data when the v2 payload is corrupted', () => {
    const localStorage = createStorage()
    localStorage.setItem(STORAGE_KEY, '{not-json')
    localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify({
      settings: { difficultyId: 'hard' },
      stats: { gamesPlayed: 4, wins: 2 }
    }))
    globalThis.window = { localStorage }

    const loaded = loadLocalData()
    expect(loaded.settings.difficultyId).toBe('hard')
    expect(loaded.statistics.legacy).toMatchObject({ gamesPlayed: 4, wins: 2 })
  })

  it('writes a versioned v2 payload without deleting the legacy key', () => {
    const localStorage = createStorage()
    localStorage.setItem(LEGACY_STORAGE_KEY, 'legacy-data')
    globalThis.window = { localStorage }
    expect(saveLocalData({
      settings: {
        difficultyId: 'normal',
        matchSettings: {
          showOpponentCards: false,
          allowAiMistakes: true,
          highlightLegalMoves: false,
          autoRefillPlayer: false
        }
      },
      statistics: createDefaultStatistics()
    })).toBe(true)
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)).version).toBe(2)
    expect(localStorage.getItem(LEGACY_STORAGE_KEY)).toBe('legacy-data')
  })
})

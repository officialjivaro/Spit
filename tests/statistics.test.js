import { describe, expect, it } from 'vitest'
import {
  createDefaultStatistics,
  recordResult
} from '../src/services/statistics.js'

function result(overrides = {}) {
  return {
    winner: 'player',
    classification: 'standard',
    difficultyId: 'normal',
    elapsedMs: 32000,
    cardsPlayed: 20,
    invalidAttempts: 1,
    aiMistakes: 2,
    stallCount: 3,
    ...overrides
  }
}

describe('separated statistics', () => {
  it('records Standard results without changing Custom totals', () => {
    const recorded = recordResult(createDefaultStatistics(), result())
    expect(recorded.statistics.standard).toMatchObject({
      gamesPlayed: 1,
      wins: 1,
      cardsPlayed: 20,
      invalidAttempts: 1,
      aiMistakes: 2,
      stallCount: 3
    })
    expect(recorded.statistics.custom.gamesPlayed).toBe(0)
    expect(recorded.isNewBest).toBe(true)
  })

  it('records Custom matches separately and never replaces the Standard best', () => {
    const first = recordResult(createDefaultStatistics(), result()).statistics
    const second = recordResult(first, result({ classification: 'custom', elapsedMs: 1000 }))
    expect(second.statistics.standard.bestWinMsByDifficulty.normal).toBe(32000)
    expect(second.statistics.custom.bestWinMsByDifficulty.normal).toBe(1000)
  })

  it('does not record Guided Practice', () => {
    const before = createDefaultStatistics()
    const after = recordResult(before, result({ classification: 'practice' }))
    expect(after.statistics).toEqual(before)
    expect(after.isNewBest).toBe(false)
  })

  it('keeps best times separated by difficulty', () => {
    let stats = recordResult(createDefaultStatistics(), result({ difficultyId: 'easy', elapsedMs: 50000 })).statistics
    stats = recordResult(stats, result({ difficultyId: 'hard', elapsedMs: 25000 })).statistics
    expect(stats.standard.bestWinMsByDifficulty.easy).toBe(50000)
    expect(stats.standard.bestWinMsByDifficulty.hard).toBe(25000)
    expect(stats.standard.bestWinMsByDifficulty.normal).toBeNull()
  })
})

import { DIFFICULTIES } from '../config/gameOptions.js'

// Statistics Model | Keeps Standard, Custom, and migrated Legacy results separate
function createBestTimes() {
  return Object.fromEntries(DIFFICULTIES.map(({ id }) => [id, null]))
}

export function createStatsBucket() {
  return {
    gamesPlayed: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    currentWinStreak: 0,
    bestWinStreak: 0,
    cardsPlayed: 0,
    invalidAttempts: 0,
    aiMistakes: 0,
    stallCount: 0,
    bestWinMsByDifficulty: createBestTimes()
  }
}

export function createDefaultStatistics() {
  return {
    standard: createStatsBucket(),
    custom: createStatsBucket(),
    legacy: null
  }
}

function safeInteger(value) {
  return Number.isInteger(value) && value >= 0 ? value : 0
}

function safeBestTime(value) {
  return Number.isFinite(value) && value > 0 ? Math.round(value) : null
}

export function sanitizeStatsBucket(value) {
  const source = value && typeof value === 'object' ? value : {}
  const bestSource = source.bestWinMsByDifficulty || {}

  return {
    gamesPlayed: safeInteger(source.gamesPlayed),
    wins: safeInteger(source.wins),
    losses: safeInteger(source.losses),
    draws: safeInteger(source.draws),
    currentWinStreak: safeInteger(source.currentWinStreak),
    bestWinStreak: safeInteger(source.bestWinStreak),
    cardsPlayed: safeInteger(source.cardsPlayed),
    invalidAttempts: safeInteger(source.invalidAttempts),
    aiMistakes: safeInteger(source.aiMistakes),
    stallCount: safeInteger(source.stallCount),
    bestWinMsByDifficulty: Object.fromEntries(
      DIFFICULTIES.map(({ id }) => [id, safeBestTime(bestSource[id])])
    )
  }
}

export function sanitizeLegacyStats(value) {
  if (!value || typeof value !== 'object') return null

  return {
    gamesPlayed: safeInteger(value.gamesPlayed),
    wins: safeInteger(value.wins),
    losses: safeInteger(value.losses),
    draws: safeInteger(value.draws),
    bestWinMs: safeBestTime(value.bestWinMs),
    currentWinStreak: safeInteger(value.currentWinStreak),
    bestWinStreak: safeInteger(value.bestWinStreak),
    cardsPlayed: safeInteger(value.cardsPlayed),
    invalidAttempts: safeInteger(value.invalidAttempts)
  }
}

export function sanitizeStatistics(value) {
  const source = value && typeof value === 'object' ? value : {}
  return {
    standard: sanitizeStatsBucket(source.standard),
    custom: sanitizeStatsBucket(source.custom),
    legacy: sanitizeLegacyStats(source.legacy)
  }
}

export function migrateLegacyStatistics(value) {
  const statistics = createDefaultStatistics()
  statistics.legacy = sanitizeLegacyStats(value)
  return statistics
}

export function recordResult(statistics, result) {
  const next = sanitizeStatistics(statistics)
  if (!result || !['standard', 'custom'].includes(result.classification)) {
    return { statistics: next, isNewBest: false }
  }

  const bucket = next[result.classification]
  const winner = result.winner
  const difficultyId = DIFFICULTIES.some(({ id }) => id === result.difficultyId)
    ? result.difficultyId
    : 'normal'
  const elapsedMs = safeBestTime(result.elapsedMs)
  const previousBest = bucket.bestWinMsByDifficulty[difficultyId]
  const isNewBest =
    winner === 'player' &&
    elapsedMs !== null &&
    (previousBest === null || elapsedMs < previousBest)

  bucket.gamesPlayed += 1
  bucket.cardsPlayed += safeInteger(result.cardsPlayed)
  bucket.invalidAttempts += safeInteger(result.invalidAttempts)
  bucket.aiMistakes += safeInteger(result.aiMistakes)
  bucket.stallCount += safeInteger(result.stallCount)

  if (winner === 'player') {
    bucket.wins += 1
    bucket.currentWinStreak += 1
    bucket.bestWinStreak = Math.max(bucket.bestWinStreak, bucket.currentWinStreak)
    if (isNewBest) bucket.bestWinMsByDifficulty[difficultyId] = elapsedMs
  } else if (winner === 'computer') {
    bucket.losses += 1
    bucket.currentWinStreak = 0
  } else {
    bucket.draws += 1
    bucket.currentWinStreak = 0
  }

  return { statistics: next, isNewBest }
}

export function bestTimeForDifficulty(bucket, difficultyId) {
  return sanitizeStatsBucket(bucket).bestWinMsByDifficulty[difficultyId] ?? null
}

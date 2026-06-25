// Game Options | Central configuration for modes, difficulty, timing, and viewport limits
export const GAME_MODES = [
  {
    id: 'quick',
    name: 'Quick Game',
    description: 'Race the computer to clear every card.',
    enabled: true,
    badge: 'Playable'
  },
  {
    id: 'practice',
    name: 'Guided Practice',
    description: 'Learn selection, placement, and refilling with live guidance.',
    enabled: true,
    badge: 'Guided'
  },
  {
    id: 'timed',
    name: 'Timed Challenge',
    description: 'Chase a target time and improve your personal best.',
    enabled: false,
    badge: 'Coming Soon'
  }
]

export const DIFFICULTIES = [
  {
    id: 'easy',
    name: 'Easy',
    description: 'A relaxed opponent that sometimes misreads the table.',
    minDelay: 1500,
    maxDelay: 2200,
    mistakeRate: 0.12
  },
  {
    id: 'normal',
    name: 'Normal',
    description: 'Balanced reactions with occasional human-like errors.',
    minDelay: 900,
    maxDelay: 1400,
    mistakeRate: 0.05
  },
  {
    id: 'hard',
    name: 'Hard',
    description: 'Fast reactions and very rare mistakes.',
    minDelay: 450,
    maxDelay: 800,
    mistakeRate: 0.01
  }
]

export const PRACTICE_TIMING = {
  minDelay: 2600,
  maxDelay: 3800,
  mistakeRate: 0
}

export const DEFAULT_MODE_ID = 'quick'
export const DEFAULT_DIFFICULTY_ID = 'normal'
export const KEYBOARD_SELECTION_MS = 900
export const POINTER_SELECTION_MS = 1800
export const COUNTDOWN_STEP_MS = 650
export const AI_MISTAKE_MIN_RECOVERY_MS = 450
export const AI_MISTAKE_MAX_RECOVERY_MS = 650
export const AUTO_REFILL_DELAY_MS = 400
export const STALL_WARNING_MS = 650
export const STALL_COUNT_STEP_MS = 650
export const STALL_REVEAL_MS = 260

export function getDifficulty(id) {
  return DIFFICULTIES.find((difficulty) => difficulty.id === id) || DIFFICULTIES[1]
}

export function getOpponentTiming(modeId, difficultyId) {
  return modeId === 'practice' ? PRACTICE_TIMING : getDifficulty(difficultyId)
}

export function isGameViewportUsable(width, height) {
  if (!Number.isFinite(width) || !Number.isFinite(height)) return true
  const portrait = height >= width
  return portrait ? width >= 340 && height >= 560 : width >= 560 && height >= 330
}

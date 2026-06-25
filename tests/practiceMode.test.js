import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { PRACTICE_MATCH_SETTINGS } from '../src/config/matchSettings.js'
import { getLegalPlayActions } from '../src/game/rules.js'
import { useGameStore } from '../src/stores/game.js'

describe('Guided Practice mode', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('forces teaching settings and a legal opening without changing preferences', () => {
    const store = useGameStore()
    store.matchSettings.autoRefillPlayer = true
    store.startGame({ modeId: 'practice', difficultyId: 'hard' })
    expect(store.activeSettings).toEqual(PRACTICE_MATCH_SETTINGS)
    expect(store.matchSettings.autoRefillPlayer).toBe(true)
    expect(store.matchClassification).toBe('practice')
    expect(getLegalPlayActions(store.game, 'player').length).toBeGreaterThan(0)
  })

  it('holds the AI through select, play, and refill guidance', () => {
    const store = useGameStore()
    store.startGame({ modeId: 'practice' })
    store.beginPlaying()
    expect(store.practiceStage).toBe('select')
    expect(store.canOpponentAct).toBe(false)

    const action = getLegalPlayActions(store.game, 'player')[0]
    store.notePracticeSelection(action.slotIndex)
    expect(store.practiceStage).toBe('play')
    expect(store.performPlayerAction(action)).toBe(true)
    expect(store.practiceStage).toBe('refill')
    expect(store.performPlayerAction({ type: 'draw', slotIndex: action.slotIndex })).toBe(true)
    expect(store.practiceStage).toBe('free')
    expect(store.canOpponentAct).toBe(true)
  })

  it('returns to the selection step when a selected card is cancelled', () => {
    const store = useGameStore()
    store.startGame({ modeId: 'practice' })
    store.beginPlaying()
    const action = getLegalPlayActions(store.game, 'player')[0]
    store.notePracticeSelection(action.slotIndex)
    store.cancelPracticeSelection()
    expect(store.practiceStage).toBe('select')
    expect(store.practiceTargetSlot).toBeNull()
  })

  it('uses the slow Practice reaction range', () => {
    const store = useGameStore()
    store.startGame({ modeId: 'practice' })
    expect(store.opponentTiming).toMatchObject({ minDelay: 2600, maxDelay: 3800, mistakeRate: 0 })
  })

  it('does not update Standard or Custom records when Practice finishes', () => {
    const store = useGameStore()
    store.startGame({ modeId: 'practice' })
    const before = JSON.stringify(store.statistics)
    store.game.outcome = { winner: 'player', reason: 'emptied-cards' }
    store.finishGame()
    expect(JSON.stringify(store.statistics)).toBe(before)
    expect(store.result.statisticsRecorded).toBe(false)
  })
})

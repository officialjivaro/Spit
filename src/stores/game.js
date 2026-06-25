import { defineStore } from 'pinia'
import {
  DEFAULT_DIFFICULTY_ID,
  DEFAULT_MODE_ID,
  DIFFICULTIES,
  GAME_MODES,
  getDifficulty,
  getOpponentTiming
} from '../config/gameOptions.js'
import {
  MATCH_SETTING_DEFINITIONS,
  classifyMatch,
  createDefaultMatchSettings,
  matchClassificationLabel,
  sanitizeMatchSettings,
  settingsForMode
} from '../config/matchSettings.js'
import { chooseComputerDecision } from '../game/ai.js'
import {
  applyGameAction,
  createInitialGame,
  evaluateGameState,
  resolveStallPair
} from '../game/engine.js'
import { getLegalPileIndices, isDeadlocked } from '../game/rules.js'
import { loadLocalData, saveLocalData } from '../services/localStorage.js'
import {
  createDefaultStatistics,
  recordResult,
  sanitizeStatistics
} from '../services/statistics.js'

// Game Store | Owns the live session, settings snapshot, lifecycle, and separated records
export const useGameStore = defineStore('game', {
  state: () => ({
    initialized: false,
    modeId: DEFAULT_MODE_ID,
    difficultyId: DEFAULT_DIFFICULTY_ID,
    matchSettings: createDefaultMatchSettings(),
    activeSettings: createDefaultMatchSettings(),
    matchClassification: 'standard',
    game: null,
    status: 'idle',
    pauseReason: '',
    pausedFromStatus: 'playing',
    sessionId: 0,
    finalizedSessionId: null,
    actionRevision: 0,
    stallRevision: 0,
    eventCounter: 0,
    lastEvents: [],
    elapsedMs: 0,
    segmentStartedAt: null,
    cardsPlayed: 0,
    invalidAttempts: 0,
    aiMistakes: 0,
    stallCount: 0,
    lastAiWasMistake: false,
    practiceStage: 'off',
    practiceTargetSlot: null,
    result: null,
    statistics: createDefaultStatistics()
  }),

  getters: {
    selectedMode(state) {
      return GAME_MODES.find((mode) => mode.id === state.modeId) || GAME_MODES[0]
    },
    selectedDifficulty(state) {
      return getDifficulty(state.difficultyId)
    },
    opponentTiming(state) {
      return getOpponentTiming(state.modeId, state.difficultyId)
    },
    classificationLabel(state) {
      return matchClassificationLabel(state.matchClassification)
    },
    playerRemaining(state) {
      if (!state.game) return 0
      return state.game.player.hand.filter(Boolean).length + state.game.player.drawPile.length
    },
    computerRemaining(state) {
      if (!state.game) return 0
      return state.game.computer.hand.filter(Boolean).length + state.game.computer.drawPile.length
    },
    hasLiveSession(state) {
      return Boolean(
        state.game && ['countdown', 'playing', 'paused', 'refreshing'].includes(state.status)
      )
    },
    canOpponentAct(state) {
      if (state.status !== 'playing' || !state.game || state.game.outcome) return false
      return state.modeId !== 'practice' || state.practiceStage === 'free'
    }
  },

  actions: {
    initialize() {
      if (this.initialized) return
      const stored = loadLocalData()
      this.difficultyId = stored.settings.difficultyId
      this.matchSettings = sanitizeMatchSettings(stored.settings.matchSettings)
      this.statistics = sanitizeStatistics(stored.statistics)
      this.initialized = true
    },

    persist() {
      saveLocalData({
        settings: {
          difficultyId: this.difficultyId,
          matchSettings: this.matchSettings
        },
        statistics: this.statistics
      })
    },

    setMode(modeId) {
      const mode = GAME_MODES.find((item) => item.id === modeId && item.enabled)
      if (mode) this.modeId = mode.id
    },

    setDifficulty(difficultyId) {
      if (!DIFFICULTIES.some((difficulty) => difficulty.id === difficultyId)) return
      this.difficultyId = difficultyId
      this.persist()
    },

    setMatchSetting(settingId, value) {
      if (!MATCH_SETTING_DEFINITIONS.some(({ id }) => id === settingId)) return
      this.matchSettings = sanitizeMatchSettings({
        ...this.matchSettings,
        [settingId]: Boolean(value)
      })
      this.persist()
    },

    resetMatchSettings() {
      this.matchSettings = createDefaultMatchSettings()
      this.persist()
    },

    startGame(options = {}) {
      const mode = GAME_MODES.find(
        (item) => item.id === (options.modeId || this.modeId) && item.enabled
      )
      const difficulty = DIFFICULTIES.find(
        (item) => item.id === (options.difficultyId || this.difficultyId)
      )

      this.modeId = mode?.id || DEFAULT_MODE_ID
      this.difficultyId = difficulty?.id || DEFAULT_DIFFICULTY_ID
      const preferenceSource = options.matchSettings || this.matchSettings
      this.activeSettings = settingsForMode(this.modeId, preferenceSource)
      this.matchClassification = classifyMatch(this.modeId, this.activeSettings)
      this.sessionId += 1
      this.finalizedSessionId = null
      this.game = createInitialGame(Math.random, {
        ensurePlayerMove: this.modeId === 'practice'
      })
      this.status = 'countdown'
      this.pauseReason = ''
      this.pausedFromStatus = 'playing'
      this.elapsedMs = 0
      this.segmentStartedAt = null
      this.cardsPlayed = 0
      this.invalidAttempts = 0
      this.aiMistakes = 0
      this.stallCount = 0
      this.lastAiWasMistake = false
      this.practiceStage = this.modeId === 'practice' ? 'select' : 'off'
      this.practiceTargetSlot = null
      this.result = null
      this.lastEvents = []
      this.actionRevision += 1
      this.stallRevision += 1
      this.persist()
    },

    beginPlaying() {
      if (!this.game || this.status !== 'countdown') return
      const evaluated = evaluateGameState(this.game)
      this.game = evaluated.state
      this.recordEvents(evaluated.events)

      if (this.game.outcome) {
        this.finishGame()
        return
      }

      this.status = 'playing'
      this.pauseReason = ''
      this.segmentStartedAt = Date.now()
      this.actionRevision += 1
      this.enterStallIfNeeded()
    },

    commitElapsed(now = Date.now()) {
      if (this.segmentStartedAt === null) return
      this.elapsedMs += Math.max(0, now - this.segmentStartedAt)
      this.segmentStartedAt = null
    },

    currentElapsedMs(now = Date.now()) {
      if (this.segmentStartedAt === null) return this.elapsedMs
      return this.elapsedMs + Math.max(0, now - this.segmentStartedAt)
    },

    pauseGame(reason = 'manual') {
      if (!['playing', 'refreshing'].includes(this.status)) return false
      this.commitElapsed()
      this.pausedFromStatus = this.status
      this.status = 'paused'
      this.pauseReason = reason
      this.actionRevision += 1
      return true
    },

    resumeGame() {
      if (this.status !== 'paused' || !this.game || this.game.outcome) return false
      this.status = this.pausedFromStatus === 'refreshing' ? 'refreshing' : 'playing'
      this.pauseReason = ''
      this.segmentStartedAt = Date.now()
      this.actionRevision += 1
      if (this.status === 'refreshing') this.stallRevision += 1
      else this.enterStallIfNeeded()
      return true
    },

    performPlayerAction(action) {
      return this.applyAction({ ...action, actor: 'player' })
    },

    performComputerTurn(random = Math.random) {
      if (!this.canOpponentAct) return { performed: false, mistake: false }

      const decision = chooseComputerDecision(this.game, {
        random,
        allowMistakes: this.activeSettings.allowAiMistakes,
        mistakeRate: this.opponentTiming.mistakeRate,
        lastWasMistake: this.lastAiWasMistake
      })

      if (decision.kind === 'mistake') {
        this.lastAiWasMistake = true
        this.aiMistakes += 1
        this.recordEvents([
          {
            ...decision.attempt,
            type: 'ai-mistake',
            actor: 'computer'
          }
        ])
        this.actionRevision += 1
        return { performed: true, mistake: true }
      }

      this.lastAiWasMistake = false
      if (decision.kind === 'action') {
        const performed = this.applyAction(decision.action)
        return { performed, mistake: false }
      }

      this.enterStallIfNeeded()
      return { performed: false, mistake: false }
    },

    applyAction(action) {
      if (this.status !== 'playing' || !this.game) return false

      const result = applyGameAction(this.game, action)
      this.recordEvents(result.events)

      if (!result.valid) {
        if (action.actor === 'player' && action.type === 'play') this.invalidAttempts += 1
        this.actionRevision += 1
        return false
      }

      this.game = result.state
      if (action.type === 'play') this.cardsPlayed += 1
      this.updatePracticeProgress(action)
      this.actionRevision += 1

      if (this.game.outcome) {
        this.finishGame()
        return true
      }

      this.enterStallIfNeeded()
      return true
    },

    enterStallIfNeeded() {
      if (this.status !== 'playing' || !this.game || !isDeadlocked(this.game)) return false
      this.status = 'refreshing'
      this.lastAiWasMistake = false
      this.stallRevision += 1
      this.actionRevision += 1
      return true
    },

    resolveCurrentStall(random = Math.random) {
      if (this.status !== 'refreshing' || !this.game) return false
      const result = resolveStallPair(this.game, random)
      if (!result.resolved) return false

      this.game = result.state
      this.recordEvents(result.events)
      if (result.events.some((event) => event.type === 'reserve-reveal')) this.stallCount += 1
      this.actionRevision += 1

      if (this.game.outcome) {
        this.finishGame()
        return true
      }

      if (result.deadlocked) {
        this.stallRevision += 1
      } else {
        this.status = 'playing'
        this.pauseReason = ''
      }
      return true
    },

    notePracticeSelection(slotIndex) {
      if (this.modeId !== 'practice' || !['select', 'play'].includes(this.practiceStage) || !this.game) return
      if (getLegalPileIndices(this.game, 'player', slotIndex).length === 0) return
      this.practiceTargetSlot = slotIndex
      this.practiceStage = 'play'
      this.actionRevision += 1
    },

    cancelPracticeSelection() {
      if (this.modeId !== 'practice' || this.practiceStage !== 'play') return
      this.practiceStage = 'select'
      this.practiceTargetSlot = null
      this.actionRevision += 1
    },

    updatePracticeProgress(action) {
      if (this.modeId !== 'practice' || action.actor !== 'player') return

      if (this.practiceStage === 'play' && action.type === 'play') {
        this.practiceTargetSlot = action.slotIndex
        this.practiceStage = 'refill'
        this.actionRevision += 1
        return
      }

      if (
        this.practiceStage === 'refill' &&
        action.type === 'draw' &&
        action.slotIndex === this.practiceTargetSlot
      ) {
        this.practiceStage = 'free'
        this.practiceTargetSlot = null
        this.recordEvents([{ type: 'practice-complete', actor: 'player' }])
        this.actionRevision += 1
      }
    },

    recordInputError(reason, details = {}) {
      if (this.status !== 'playing') return
      this.recordEvents([
        {
          type: 'invalid',
          actor: 'player',
          actionType: 'input',
          reason,
          slotIndex: Number.isInteger(details.slotIndex) ? details.slotIndex : null,
          pileIndex: Number.isInteger(details.pileIndex) ? details.pileIndex : null
        }
      ])
      this.actionRevision += 1
    },

    recordEvents(events = []) {
      if (events.length === 0) return
      const stamped = events.map((event) => {
        this.eventCounter += 1
        return { ...event, id: this.eventCounter }
      })
      this.lastEvents = [...this.lastEvents, ...stamped].slice(-12)
    },

    finishGame() {
      if (!this.game?.outcome || this.finalizedSessionId === this.sessionId) return

      this.commitElapsed()
      this.status = 'finished'
      this.pauseReason = ''
      this.finalizedSessionId = this.sessionId

      const provisional = {
        sessionId: this.sessionId,
        winner: this.game.outcome.winner,
        reason: this.game.outcome.reason,
        elapsedMs: Math.round(this.elapsedMs),
        cardsPlayed: this.cardsPlayed,
        invalidAttempts: this.invalidAttempts,
        aiMistakes: this.aiMistakes,
        stallCount: this.stallCount,
        playerRemaining: this.playerRemaining,
        computerRemaining: this.computerRemaining,
        modeId: this.modeId,
        modeName: this.selectedMode.name,
        difficultyId: this.difficultyId,
        difficultyName: this.selectedDifficulty.name,
        classification: this.matchClassification,
        classificationLabel: this.classificationLabel,
        settings: { ...this.activeSettings },
        statisticsRecorded: ['standard', 'custom'].includes(this.matchClassification),
        finishedAt: new Date().toISOString()
      }

      const recorded = recordResult(this.statistics, provisional)
      this.statistics = recorded.statistics
      this.result = { ...provisional, isNewBest: recorded.isNewBest }
      this.persist()
      this.actionRevision += 1
    },

    rematch() {
      this.startGame({
        modeId: this.modeId,
        difficultyId: this.difficultyId,
        matchSettings: this.activeSettings
      })
    },

    abandonGame({ keepResult = false } = {}) {
      this.commitElapsed()
      this.game = null
      this.status = 'idle'
      this.pauseReason = ''
      this.pausedFromStatus = 'playing'
      this.segmentStartedAt = null
      this.lastEvents = []
      this.practiceStage = 'off'
      this.practiceTargetSlot = null
      if (!keepResult) this.result = null
      this.actionRevision += 1
      this.stallRevision += 1
    }
  }
})

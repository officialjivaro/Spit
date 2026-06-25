<template>
  <section class="game-view app-page">
    <div v-if="game.status === 'active'" class="game-stage">
      <GameStatusBar
        class="game-stage__status"
        :mode-label="modeConfig.label"
        :difficulty-label="difficultyLabel"
        :timer-type="modeConfig.timerType"
        :show-timer="modeConfig.showTimer"
        :show-mistakes="modeConfig.showMistakes"
        :started-at="game.startedAt"
        :deadline="game.deadline"
        :mistakes="game.mistakes"
        :hints-remaining="game.hintsRemaining"
        @expired="handleExpired"
      />

      <div class="game-stage__board">
        <SudokuBoard
          ref="boardRef"
          :puzzle="game.puzzle"
          :solution="game.solution"
          :entries="game.entries"
          :notes="game.notes"
          :selected-cell="game.selectedCell"
          :hinted-cells="game.hintedCells"
          :show-errors="modeConfig.immediateErrors"
          :highlight-editable="highlightEditable"
          @select-cell="handleCellSelection"
        />
      </div>

      <GameControlPanel
        class="game-stage__controls"
        :completed-numbers="completedNumbers"
        :notes-mode="game.notesMode"
        :can-undo="game.history.length > 0"
        :can-redo="game.future.length > 0"
        :hints-remaining="game.hintsRemaining"
        :highlight-editable="highlightEditable"
        @digit="handleDigit"
        @toggle-notes="handleToggleNotes"
        @erase="handleErase"
        @undo="handleUndo"
        @redo="handleRedo"
        @hint="handleHint"
        @home="returnHome"
        @update:highlight-editable="highlightEditable = $event"
      />
    </div>
  </section>
</template>

<script setup>
import { computed, nextTick, onBeforeMount, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import GameControlPanel from '../components/game/GameControlPanel.vue'
import GameStatusBar from '../components/game/GameStatusBar.vue'
import SudokuBoard from '../components/game/SudokuBoard.vue'
import { useGameSession } from '../composables/useGameSession.js'
import { useSudokuKeyboard } from '../composables/useSudokuKeyboard.js'
import { DIFFICULTIES, normalizeDifficulty } from '../constants/difficulties.js'
import { GAME_MODES, normalizeGameMode, resolveModeDifficulty } from '../constants/gameModes.js'

const route = useRoute()
const router = useRouter()
const boardRef = ref(null)
const highlightEditable = ref(false)
const {
  game,
  startGame,
  selectCell,
  moveSelection,
  enterDigit,
  eraseSelected,
  toggleNotesMode,
  undo,
  redo,
  useHint,
  expireGame,
  abandonGame
} = useGameSession()

const modeConfig = computed(() => GAME_MODES[game.mode] || GAME_MODES.classic)
const difficultyLabel = computed(() => DIFFICULTIES[game.difficulty]?.label || DIFFICULTIES.easy.label)
const completedNumbers = computed(() => {
  const completed = []

  for (let digit = 1; digit <= 9; digit += 1) {
    let correctCount = 0

    for (let row = 0; row < 9; row += 1) {
      for (let column = 0; column < 9; column += 1) {
        if (game.entries[row][column] === digit && game.solution[row][column] === digit) {
          correctCount += 1
        }
      }
    }

    if (correctCount === 9) {
      completed.push(digit)
    }
  }

  return completed
})

onBeforeMount(async () => {
  const requestedMode = normalizeGameMode(route.query.mode)
  const requestedDifficulty = resolveModeDifficulty(requestedMode, normalizeDifficulty(route.query.difficulty))
  const sessionMatchesRoute = game.status === 'active' &&
    game.mode === requestedMode &&
    game.difficulty === requestedDifficulty

  if (!sessionMatchesRoute) {
    startGame({ mode: requestedMode, difficulty: requestedDifficulty })
  }

  if (game.status !== 'active') {
    await router.replace({ name: 'end' })
    return
  }

  if (!game.selectedCell) {
    const firstEditable = findFirstEditableCell()
    selectCell(firstEditable.row, firstEditable.column)
  }

  await focusSelectedCell()
})

function findFirstEditableCell() {
  for (let row = 0; row < 9; row += 1) {
    for (let column = 0; column < 9; column += 1) {
      if (game.puzzle[row][column] === 0) {
        return { row, column }
      }
    }
  }

  return { row: 0, column: 0 }
}

async function focusSelectedCell() {
  await nextTick()
  boardRef.value?.focusSelectedCell()
}

function handleCellSelection(cell) {
  selectCell(cell.row, cell.column)
}

async function routeIfFinished() {
  if (game.status === 'completed' || game.status === 'expired') {
    await router.replace({ name: 'end' })
  }
}

async function handleDigit(digit) {
  enterDigit(digit)
  await focusSelectedCell()
  await routeIfFinished()
}

async function handleToggleNotes() {
  toggleNotesMode()
  await focusSelectedCell()
}

async function handleErase() {
  eraseSelected()
  await focusSelectedCell()
}

async function handleUndo() {
  undo()
  await focusSelectedCell()
}

async function handleRedo() {
  redo()
  await focusSelectedCell()
}

async function handleHint() {
  useHint()
  await focusSelectedCell()
  await routeIfFinished()
}

async function handleExpired() {
  if (game.status !== 'active') {
    return
  }

  expireGame()
  await router.replace({ name: 'end' })
}

async function returnHome() {
  abandonGame({ preserveDaily: true })
  await router.push({ name: 'home' })
}

useSudokuKeyboard({
  isActive: () => game.status === 'active',
  onDigit: handleDigit,
  onMove: moveSelection,
  onErase: eraseSelected,
  onToggleNotes: toggleNotesMode,
  onUndo: undo,
  onRedo: redo,
  onHint: handleHint,
  onFocusSelected: focusSelectedCell
})
</script>

<style scoped>
.game-view {
  padding: clamp(0.3rem, 0.8vmin, 0.65rem);
}

.game-stage {
  --board-size: min(64dvh, 58vw, 42rem);
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(17rem, 22rem);
  grid-template-rows: auto minmax(0, 1fr);
  gap: clamp(0.45rem, 1.1vmin, 0.85rem);
  inline-size: min(98vw, 78rem);
  block-size: 100%;
  min-block-size: 0;
}

.game-stage__status {
  grid-column: 1 / -1;
  align-self: center;
}

.game-stage__board {
  display: grid;
  place-items: center;
  min-inline-size: 0;
  min-block-size: 0;
}

.game-stage__controls {
  align-self: center;
  max-block-size: 100%;
}

@media (max-width: 54rem) {
  .game-stage {
    --board-size: min(88vw, 54dvh, 35rem);
    grid-template-columns: 1fr;
    grid-template-rows: auto auto auto;
    align-content: center;
    inline-size: 100%;
    gap: 0.35rem;
  }

  .game-stage__status {
    grid-column: 1;
  }

  .game-stage__controls {
    inline-size: min(96vw, 42rem);
  }
}

@media (max-height: 36rem) and (min-width: 54.01rem) {
  .game-stage {
    --board-size: min(70dvh, 48vw, 30rem);
  }
}

@media (max-height: 43rem) and (max-width: 54rem) {
  .game-stage {
    --board-size: min(78vw, 47dvh, 28rem);
  }
}
</style>

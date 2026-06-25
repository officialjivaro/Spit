<template>
  <Transition name="modal-fade">
    <div v-if="leaderboard.state.open" class="leaderboard-overlay" role="presentation" @click.self="close">
      <section class="leaderboard-modal glass-panel" role="dialog" aria-modal="true" aria-labelledby="leaderboard-title">
        <button class="modal-close" type="button" aria-label="Close rankings" @click="close">×</button>

        <header class="leaderboard-heading">
          <span>Online Rankings</span>
          <h2 id="leaderboard-title">Sudoku Champions</h2>
          <p>Verified signed-in results only. Zen Mode remains unranked.</p>
        </header>

        <div class="leaderboard-controls">
          <div class="tab-row" role="tablist" aria-label="Ranked game mode">
            <button
              v-for="mode in modes"
              :key="mode.id"
              type="button"
              role="tab"
              :aria-selected="leaderboard.state.mode === mode.id"
              :class="['tab-button', { 'tab-button--active': leaderboard.state.mode === mode.id }]"
              @click="selectMode(mode.id)"
            >
              {{ mode.label }}
            </button>
          </div>

          <div v-if="leaderboard.state.mode !== 'daily'" class="tab-row" role="tablist" aria-label="Difficulty">
            <button
              v-for="difficulty in difficulties"
              :key="difficulty.key"
              type="button"
              role="tab"
              :aria-selected="leaderboard.state.difficulty === difficulty.key"
              :class="['tab-button', { 'tab-button--active': leaderboard.state.difficulty === difficulty.key }]"
              @click="selectDifficulty(difficulty.key)"
            >
              {{ difficulty.label }}
            </button>
          </div>

          <p v-else class="daily-label">UTC challenge: {{ leaderboard.state.dailyDate }}</p>
        </div>

        <div v-if="!online.isConfigured.value" class="leaderboard-state">
          Online rankings are unavailable until the shared Supabase project is configured.
        </div>
        <div v-else-if="leaderboard.state.loading" class="leaderboard-state">Loading rankings…</div>
        <div v-else-if="leaderboard.state.error" class="leaderboard-state leaderboard-state--error" role="alert">
          <span>{{ leaderboard.state.error }}</span>
          <AppButton size="small" @click="reload">Try Again</AppButton>
        </div>
        <div v-else-if="!leaderboard.state.entries.length" class="leaderboard-state">
          No verified scores yet. The first row is feeling very available.
        </div>

        <div v-else class="leaderboard-table-wrap">
          <table class="leaderboard-table">
            <thead>
              <tr>
                <th scope="col">Rank</th>
                <th scope="col">Player</th>
                <th scope="col">{{ scoreHeading }}</th>
                <th scope="col">Mistakes</th>
                <th scope="col">Hints</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="entry in leaderboard.state.entries"
                :key="`${entry.leaderboard_rank}-${entry.display_name}-${entry.created_at}`"
                :class="{ 'leaderboard-row--current': entry.is_current_user }"
              >
                <td class="rank-cell">#{{ entry.leaderboard_rank }}</td>
                <td>{{ entry.display_name }}</td>
                <td class="score-cell">{{ formatScore(entry) }}</td>
                <td>{{ entry.mistakes }}</td>
                <td>{{ entry.hints_used }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </Transition>
</template>

<script setup>
import { computed, onBeforeUnmount, watch } from 'vue'
import { DIFFICULTY_OPTIONS } from '../../constants/difficulties.js'
import { useSudokuLeaderboard } from '../../composables/useSudokuLeaderboard.js'
import { useSudokuOnline } from '../../composables/useSudokuOnline.js'
import { formatTime } from '../../utils/formatTime.js'
import AppButton from '../ui/AppButton.vue'

const leaderboard = useSudokuLeaderboard()
const online = useSudokuOnline()
const difficulties = DIFFICULTY_OPTIONS
const modes = Object.freeze([
  { id: 'classic', label: 'Classic' },
  { id: 'daily', label: 'Daily' },
  { id: 'sprint', label: 'Sprint' }
])

const scoreHeading = computed(() => leaderboard.state.mode === 'sprint' ? 'Time Left' : 'Time')

watch(
  () => leaderboard.state.open,
  open => {
    if (open) window.addEventListener('keydown', handleKeydown)
    else window.removeEventListener('keydown', handleKeydown)
  }
)

onBeforeUnmount(() => window.removeEventListener('keydown', handleKeydown))

function close() {
  leaderboard.close()
}

function handleKeydown(event) {
  if (event.key === 'Escape') close()
}

async function selectMode(mode) {
  await leaderboard.load({ mode, difficulty: mode === 'daily' ? 'medium' : leaderboard.state.difficulty })
}

async function selectDifficulty(difficulty) {
  await leaderboard.load({ difficulty })
}

async function reload() {
  await leaderboard.load()
}

function formatScore(entry) {
  const seconds = leaderboard.state.mode === 'sprint'
    ? Number(entry.time_remaining_seconds || 0)
    : Number(entry.elapsed_seconds || 0)
  return formatTime(seconds)
}
</script>

<style scoped>
.leaderboard-overlay {
  position: fixed;
  z-index: 82;
  inset: 0;
  display: grid;
  place-items: center;
  padding: clamp(0.55rem, 2vw, 1.5rem);
  background: rgba(24, 18, 22, 0.7);
  backdrop-filter: blur(9px);
}

.leaderboard-modal {
  position: relative;
  display: grid;
  grid-template-rows: auto auto minmax(0, 1fr);
  gap: 0.8rem;
  inline-size: min(66rem, 100%);
  max-block-size: 92dvh;
  padding: clamp(0.8rem, 2.2vw, 1.6rem);
  overflow: hidden;
}

.modal-close {
  position: absolute;
  z-index: 3;
  inset-block-start: 0.65rem;
  inset-inline-end: 0.75rem;
  inline-size: 2.4rem;
  block-size: 2.4rem;
  border: 1px solid rgba(52, 44, 48, 0.28);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.86);
  color: var(--color-ink);
  font-size: 1.65rem;
  cursor: pointer;
}

.leaderboard-heading {
  padding-inline-end: 2.5rem;
}

.leaderboard-heading span {
  color: var(--color-pink-shadow);
  font-size: 0.68rem;
  font-weight: 900;
  letter-spacing: 0.13em;
  text-transform: uppercase;
}

.leaderboard-heading h2 {
  margin: 0.2rem 0 0.25rem;
  color: var(--color-ink);
  font-size: clamp(1.45rem, 4vw, 2.45rem);
}

.leaderboard-heading p,
.daily-label {
  margin: 0;
  color: rgba(37, 33, 36, 0.7);
  font-size: 0.78rem;
}

.leaderboard-controls {
  display: grid;
  gap: 0.45rem;
}

.tab-row {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.35rem;
}

.tab-button {
  min-block-size: 2.35rem;
  padding: 0.4rem 0.8rem;
  border: 1px solid rgba(189, 112, 133, 0.25);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.65);
  color: rgba(37, 33, 36, 0.72);
  font-weight: 850;
  cursor: pointer;
}

.tab-button--active {
  border-color: var(--color-pink-border);
  background: linear-gradient(145deg, var(--color-pink-light), var(--color-pink));
  color: #4d2230;
  box-shadow: 0 0.2rem 0 var(--color-pink-shadow);
}

.daily-label {
  text-align: center;
}

.leaderboard-state {
  min-block-size: 12rem;
  display: grid;
  place-items: center;
  align-content: center;
  gap: 0.7rem;
  padding: 1rem;
  color: rgba(37, 33, 36, 0.72);
  text-align: center;
}

.leaderboard-state--error {
  color: #8b243b;
}

.leaderboard-table-wrap {
  min-block-size: 0;
  overflow: auto;
  border: 1px solid rgba(189, 112, 133, 0.24);
  border-radius: var(--radius-medium);
  background: rgba(255, 255, 255, 0.68);
}

.leaderboard-table {
  inline-size: 100%;
  border-collapse: collapse;
  font-size: clamp(0.7rem, 1.5vw, 0.92rem);
}

.leaderboard-table th,
.leaderboard-table td {
  padding: 0.58rem 0.65rem;
  border-block-end: 1px solid rgba(189, 112, 133, 0.16);
  text-align: start;
  white-space: nowrap;
}

.leaderboard-table th {
  position: sticky;
  inset-block-start: 0;
  z-index: 1;
  background: rgba(255, 239, 244, 0.97);
  color: #633247;
  font-size: 0.7em;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.leaderboard-row--current {
  background: rgba(255, 216, 225, 0.72);
  font-weight: 850;
}

.rank-cell,
.score-cell {
  color: #79384e;
  font-weight: 900;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 160ms ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>

<script setup>
import { computed } from 'vue'
import { MATCH_SETTING_DEFINITIONS } from '../../config/matchSettings.js'
import AppButton from '../common/AppButton.vue'

const props = defineProps({
  result: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['rematch', 'home'])

const title = computed(() => {
  if (props.result.winner === 'player') return 'You Win!'
  if (props.result.winner === 'computer') return 'Computer Wins'
  return 'Draw Game'
})

const message = computed(() => {
  if (props.result.classification === 'practice') return 'Training complete. No competitive record was changed.'
  if (props.result.winner === 'player') return 'Fast hands. Clean finish.'
  if (props.result.winner === 'computer') return 'The rematch is one button away.'
  return 'The table ran out of reserve cards.'
})

const formattedTime = computed(() => {
  const totalSeconds = props.result.elapsedMs / 1000
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = (totalSeconds % 60).toFixed(1).padStart(4, '0')
  return `${String(minutes).padStart(2, '0')}:${seconds}`
})

const settingSummary = computed(() =>
  MATCH_SETTING_DEFINITIONS.map(({ id, name }) => ({
    id,
    name,
    enabled: Boolean(props.result.settings?.[id])
  }))
)
</script>

<template>
  <!-- Result Summary | Explains match classification, settings, and recorded performance -->
  <section class="result-summary" :class="`result-summary--${result.winner}`">
    <div class="result-orbit" aria-hidden="true"><span>♠</span><span>♥</span><span>♦</span><span>♣</span></div>
    <div class="result-kickers">
      <span>{{ result.modeName }} Complete</span>
      <strong :class="`classification classification--${result.classification}`">
        {{ result.classificationLabel }}
      </strong>
    </div>
    <h1>{{ title }}</h1>
    <p>{{ message }}</p>
    <strong v-if="result.isNewBest" class="new-best">
      New {{ result.classificationLabel.toLowerCase() }} best
    </strong>

    <div class="result-stats">
      <div><span>Time</span><strong>{{ formattedTime }}</strong></div>
      <div><span>Difficulty</span><strong>{{ result.modeId === 'practice' ? 'Training' : result.difficultyName }}</strong></div>
      <div><span>Cards played</span><strong>{{ result.cardsPlayed }}</strong></div>
      <div><span>Invalid moves</span><strong>{{ result.invalidAttempts }}</strong></div>
      <div><span>AI mistakes</span><strong>{{ result.aiMistakes }}</strong></div>
      <div><span>Reserve calls</span><strong>{{ result.stallCount }}</strong></div>
      <div><span>CPU cards left</span><strong>{{ result.computerRemaining }}</strong></div>
      <div><span>Your cards left</span><strong>{{ result.playerRemaining }}</strong></div>
    </div>

    <details class="settings-summary">
      <summary>Settings used</summary>
      <div class="settings-list">
        <span v-for="setting in settingSummary" :key="setting.id">
          <i :class="{ 'setting-on': setting.enabled }" aria-hidden="true"></i>
          {{ setting.name }}: {{ setting.enabled ? 'On' : 'Off' }}
        </span>
      </div>
    </details>

    <p class="record-note">
      {{ result.statisticsRecorded ? `${result.classificationLabel} statistics were updated.` : 'Practice results are not ranked.' }}
    </p>

    <div class="result-actions">
      <AppButton size="large" block @click="emit('rematch')">Rematch</AppButton>
      <AppButton variant="secondary" size="large" block @click="emit('home')">Change Mode</AppButton>
    </div>
  </section>
</template>

<style scoped>
.result-summary {
  position: relative;
  width: min(52rem, 100%);
  max-height: 100%;
  overflow: hidden;
  padding: clamp(0.8rem, 2.2vw, 1.7rem);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-large);
  text-align: center;
  background: radial-gradient(circle at 50% 0%, rgba(166, 64, 52, 0.16), transparent 36%), repeating-linear-gradient(90deg, rgba(216, 178, 106, 0.02) 0 1px, transparent 1px 0.78rem), linear-gradient(145deg, rgba(57, 54, 43, 0.98), rgba(13, 16, 13, 0.99));
  box-shadow: var(--shadow-panel), var(--shadow-brass);
  animation: result-rise var(--transition-slow) both;
}

.result-summary::before,
.result-summary::after {
  content: '';
  position: absolute;
  width: 2.2rem;
  height: 2.2rem;
  opacity: 0.6;
}
.result-summary::before { left: 0.55rem; top: 0.55rem; border-left: 2px solid var(--color-accent); border-top: 2px solid var(--color-accent); }
.result-summary::after { right: 0.55rem; bottom: 0.55rem; border-right: 2px solid var(--color-secondary); border-bottom: 2px solid var(--color-secondary); }
.result-summary--computer { border-color: rgba(95, 145, 137, 0.74); box-shadow: var(--shadow-panel), var(--shadow-secondary); }

.result-kickers { display: flex; justify-content: center; align-items: center; gap: 0.45rem; }
.result-kickers > span {
  color: var(--color-secondary-bright);
  font-size: clamp(0.5rem, 0.8vw, 0.66rem);
  font-weight: 850;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.classification {
  padding: 0.16rem 0.42rem;
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-small);
  color: var(--color-brass-bright);
  font-size: 0.52rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  background: rgba(13, 16, 13, 0.72);
}
.classification--practice { color: var(--color-secondary-bright); border-color: rgba(134, 188, 177, 0.5); }
.classification--custom { color: var(--color-warning); }

.result-summary h1 {
  margin: 0.3rem 0 0.3rem;
  color: var(--color-parchment);
  font-family: var(--font-display);
  font-size: clamp(1.55rem, 4.3vw, 3.2rem);
  line-height: 1;
  text-transform: uppercase;
}
.result-summary > p { margin-bottom: 0.5rem; color: var(--color-text-muted); font-size: 0.78rem; }

.new-best {
  display: inline-flex;
  margin-bottom: 0.55rem;
  padding: 0.22rem 0.52rem;
  border: 1px solid rgba(207, 174, 107, 0.62);
  border-radius: var(--radius-small);
  color: var(--color-brass-bright);
  font-size: 0.6rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  background: rgba(70, 48, 20, 0.4);
}

.result-stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.38rem;
  margin: 0.55rem 0;
}

.result-stats div {
  display: grid;
  gap: 0.16rem;
  padding: 0.5rem;
  border: 1px solid rgba(193, 155, 83, 0.22);
  border-radius: var(--radius-small);
  background: rgba(13, 16, 13, 0.62);
}
.result-stats span { color: var(--color-text-muted); font-size: clamp(0.42rem, 0.65vw, 0.54rem); font-weight: 850; letter-spacing: 0.07em; text-transform: uppercase; }
.result-stats strong { color: var(--color-brass-bright); font-family: var(--font-display); font-size: clamp(0.6rem, 1vw, 0.82rem); font-variant-numeric: tabular-nums; }

.settings-summary {
  margin-bottom: 0.4rem;
  padding: 0.36rem 0.5rem;
  border: 1px solid rgba(193, 155, 83, 0.2);
  border-radius: var(--radius-small);
  text-align: left;
  background: rgba(13, 16, 13, 0.46);
}
.settings-summary summary { color: var(--color-brass-bright); font-size: 0.56rem; font-weight: 850; text-transform: uppercase; cursor: pointer; }
.settings-list { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.22rem 0.55rem; margin-top: 0.35rem; }
.settings-list span { color: var(--color-text-muted); font-size: 0.54rem; }
.settings-list i { display: inline-block; width: 0.42rem; aspect-ratio: 1; margin-right: 0.26rem; border-radius: 50%; background: var(--color-metal); }
.settings-list i.setting-on { background: var(--color-success); box-shadow: 0 0 0.4rem rgba(141, 167, 103, 0.55); }

.record-note { margin: 0 0 0.45rem !important; font-size: 0.56rem !important; }
.result-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; }

.result-orbit { position: absolute; inset: 0; pointer-events: none; opacity: 0.07; }
.result-orbit span { position: absolute; color: var(--color-parchment); font-size: clamp(2rem, 7vw, 5rem); }
.result-orbit span:nth-child(1) { left: 5%; top: 8%; transform: rotate(-18deg); }
.result-orbit span:nth-child(2) { right: 7%; top: 10%; transform: rotate(15deg); color: var(--color-card-red); }
.result-orbit span:nth-child(3) { left: 9%; bottom: 8%; transform: rotate(12deg); color: var(--color-card-red); }
.result-orbit span:nth-child(4) { right: 6%; bottom: 6%; transform: rotate(-14deg); }

@media (max-width: 560px) {
  .result-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .settings-list { grid-template-columns: 1fr; }
}

@media (max-height: 560px) {
  .settings-summary,
  .record-note { display: none; }
  .result-summary { padding: 0.65rem; }
  .result-stats { margin-block: 0.35rem; }
}
</style>

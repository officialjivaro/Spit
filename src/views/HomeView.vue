<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppButton from '../components/common/AppButton.vue'
import PlayingCard from '../components/game/PlayingCard.vue'
import DifficultySelector from '../components/home/DifficultySelector.vue'
import MatchSettings from '../components/home/MatchSettings.vue'
import ModeSelector from '../components/home/ModeSelector.vue'
import StatsPanel from '../components/home/StatsPanel.vue'
import { DIFFICULTIES, GAME_MODES } from '../config/gameOptions.js'
import {
  PRACTICE_MATCH_SETTINGS,
  classifyMatch,
  matchClassificationLabel
} from '../config/matchSettings.js'
import { createStandardDeck } from '../game/cards.js'
import { useGameStore } from '../stores/game.js'

const router = useRouter()
const store = useGameStore()
const deck = createStandardDeck()
const sampleCards = [deck[12], deck[27], deck[41]]

const selectedMode = computed({
  get: () => store.modeId,
  set: (value) => store.setMode(value)
})

const selectedDifficulty = computed({
  get: () => store.difficultyId,
  set: (value) => store.setDifficulty(value)
})

const isPractice = computed(() => selectedMode.value === 'practice')
const displayedSettings = computed(() =>
  isPractice.value ? PRACTICE_MATCH_SETTINGS : store.matchSettings
)
const classification = computed(() =>
  classifyMatch(selectedMode.value, displayedSettings.value)
)
const classificationLabel = computed(() => matchClassificationLabel(classification.value))
const startLabel = computed(() =>
  isPractice.value ? 'Start Guided Practice' : 'Start Quick Game'
)

function updateSetting(settingId, value) {
  store.setMatchSetting(settingId, value)
}

function startGame() {
  store.startGame({
    modeId: selectedMode.value,
    difficultyId: selectedDifficulty.value,
    matchSettings: store.matchSettings
  })
  router.push({ name: 'play' })
}

onMounted(() => {
  if (store.status === 'finished') store.abandonGame({ keepResult: true })
})
</script>

<template>
  <!-- Home Screen | Configures Standard, Custom, or Guided Practice matches -->
  <section class="home-view" aria-labelledby="home-title">
    <div class="home-panel">
      <div class="home-visual" aria-hidden="true">
        <div class="visual-copy">
          <span>Mechanized Card Racing</span>
          <strong>Think fast.<br />Strike first.</strong>
        </div>
        <div class="card-fan">
          <div
            v-for="(card, index) in sampleCards"
            :key="card.id"
            class="fan-card"
            :class="`fan-card--${index}`"
          >
            <PlayingCard :card="card" />
          </div>
        </div>
        <div class="visual-instruction">
          <kbd>1</kbd><span>+</span><kbd>←</kbd><strong>Play left</strong>
        </div>
      </div>

      <div class="home-content">
        <header class="home-intro">
          <span class="home-kicker">Classic Speed · Tactical Solo</span>
          <h1 id="home-title">Clear your cards first</h1>
          <p>Play one rank higher or lower. Suits do not matter, and Ace connects to 2 and King.</p>
        </header>

        <ModeSelector v-model="selectedMode" :modes="GAME_MODES" />

        <DifficultySelector
          v-if="!isPractice"
          v-model="selectedDifficulty"
          :difficulties="DIFFICULTIES"
        />
        <div v-else class="practice-brief">
          <strong>Guided training protocol</strong>
          <span>The opponent waits while you learn, then continues at a slow natural pace.</span>
        </div>

        <MatchSettings
          :settings="displayedSettings"
          :classification-label="classificationLabel"
          :locked="isPractice"
          @update-setting="updateSetting"
          @reset="store.resetMatchSettings()"
        />

        <StatsPanel :statistics="store.statistics" :difficulty-id="selectedDifficulty" />

        <div class="home-footer">
          <details class="rules-disclosure">
            <summary>Controls & rules</summary>
            <p>
              Press <strong>1–5</strong> or tap a card, then use an arrow or tap a center pile.
              Press or tap an empty slot to draw.
            </p>
          </details>
          <AppButton size="large" block @click="startGame">{{ startLabel }}</AppButton>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.home-view {
  width: 100%;
  height: 100%;
  min-height: 0;
  display: grid;
  place-items: center;
  padding: clamp(0.42rem, 1.35vw, 1.15rem);
  overflow: hidden;
}

.home-panel {
  position: relative;
  width: min(var(--content-max-width), 100%);
  height: 100%;
  min-height: 0;
  display: grid;
  grid-template-columns: minmax(15rem, 0.72fr) minmax(29rem, 1.28fr);
  gap: clamp(0.55rem, 1.2vw, 1rem);
  padding: clamp(0.55rem, 1.2vw, 1rem);
  overflow: hidden;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-large);
  background:
    repeating-linear-gradient(90deg, rgba(219, 181, 107, 0.018) 0 1px, transparent 1px 0.8rem),
    linear-gradient(145deg, rgba(48, 46, 37, 0.96), rgba(13, 16, 13, 0.98));
  box-shadow: var(--shadow-panel);
}

.home-panel::before,
.home-panel::after {
  content: '';
  position: absolute;
  z-index: 3;
  width: 0.5rem;
  height: 0.5rem;
  border: 1px solid rgba(215, 180, 109, 0.48);
  border-radius: 50%;
  background: #2c2b24;
  pointer-events: none;
}

.home-panel::before { left: 0.5rem; top: 0.5rem; }
.home-panel::after { right: 0.5rem; bottom: 0.5rem; }

.home-visual {
  position: relative;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  border: 1px solid rgba(203, 166, 96, 0.38);
  border-radius: var(--radius-medium);
  background:
    linear-gradient(180deg, transparent, rgba(7, 9, 7, 0.62)),
    radial-gradient(circle at 50% 58%, rgba(166, 64, 52, 0.2), transparent 38%),
    linear-gradient(145deg, #393428, #1b211c 72%);
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.48), 0 0 2rem rgba(166, 64, 52, 0.1) inset;
}

.home-visual::before {
  content: '';
  position: absolute;
  inset: 0;
  opacity: 0.3;
  background-image:
    linear-gradient(rgba(218, 181, 108, 0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(218, 181, 108, 0.06) 1px, transparent 1px),
    linear-gradient(135deg, transparent 45%, rgba(132, 48, 39, 0.11) 45.2% 54.8%, transparent 55%);
  background-size: 2.2rem 2.2rem, 2.2rem 2.2rem, 100% 100%;
}

.visual-copy {
  position: absolute;
  z-index: 2;
  left: 8%;
  top: 8%;
}

.visual-copy span {
  display: block;
  margin-bottom: 0.4rem;
  color: var(--color-secondary-bright);
  font-size: clamp(0.5rem, 0.9vw, 0.68rem);
  font-weight: 850;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.visual-copy strong {
  color: var(--color-parchment);
  font-family: var(--font-display);
  font-size: clamp(1.3rem, 3.4vw, 2.8rem);
  line-height: 1.02;
  text-transform: uppercase;
  text-shadow: 0 4px 18px rgba(0, 0, 0, 0.68), 0 0 2rem rgba(166, 64, 52, 0.2);
}

.card-fan {
  position: absolute;
  z-index: 2;
  left: 50%;
  top: 58%;
  width: min(72%, 24rem);
  height: 54%;
  transform: translate(-50%, -50%);
}

.fan-card {
  position: absolute;
  left: 50%;
  top: 50%;
  width: clamp(5rem, 10.5vw, 8rem);
  aspect-ratio: 1 / var(--card-ratio);
  transform-origin: 50% 110%;
  filter: drop-shadow(0 16px 18px rgba(0, 0, 0, 0.4));
}

.fan-card--0 { transform: translate(-85%, -40%) rotate(-17deg); }
.fan-card--1 { z-index: 2; transform: translate(-50%, -54%); }
.fan-card--2 { transform: translate(-15%, -40%) rotate(17deg); }

.visual-instruction {
  position: absolute;
  z-index: 3;
  left: 50%;
  bottom: 5%;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.45rem 0.65rem;
  border: 1px solid rgba(198, 158, 84, 0.38);
  border-radius: var(--radius-small);
  color: var(--color-text-muted);
  font-size: 0.6rem;
  background: rgba(13, 16, 13, 0.82);
  transform: translateX(-50%);
  white-space: nowrap;
}

.visual-instruction kbd {
  display: grid;
  min-width: 1.5rem;
  height: 1.4rem;
  place-items: center;
  border: 1px solid var(--color-brass);
  border-radius: 0.22rem;
  color: var(--color-parchment);
  background: linear-gradient(180deg, #4b3a26, #211d16);
}

.visual-instruction strong { color: var(--color-accent-bright); text-transform: uppercase; }

.home-content {
  min-width: 0;
  min-height: 0;
  display: grid;
  grid-template-rows: auto auto auto auto auto auto;
  align-content: center;
  gap: clamp(0.32rem, 0.7vh, 0.6rem);
}

.home-kicker {
  color: var(--color-secondary-bright);
  font-size: clamp(0.48rem, 0.78vw, 0.64rem);
  font-weight: 850;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.home-intro h1 {
  margin: 0.2rem 0 0.3rem;
  color: var(--color-parchment);
  font-family: var(--font-display);
  font-size: clamp(1.25rem, 3vw, 2.45rem);
  line-height: 1.02;
  text-transform: uppercase;
}

.home-intro p {
  margin: 0;
  color: var(--color-text-muted);
  font-size: clamp(0.58rem, 0.86vw, 0.74rem);
  line-height: 1.4;
}

.practice-brief {
  display: grid;
  gap: 0.16rem;
  padding: 0.58rem 0.68rem;
  border: 1px solid rgba(134, 188, 177, 0.42);
  border-left: 3px solid var(--color-secondary-bright);
  border-radius: var(--radius-small);
  background: rgba(17, 28, 24, 0.62);
}

.practice-brief strong {
  color: var(--color-parchment);
  font-family: var(--font-display);
  font-size: 0.7rem;
  text-transform: uppercase;
}

.practice-brief span { color: var(--color-text-muted); font-size: 0.58rem; }

.home-footer {
  display: grid;
  grid-template-columns: minmax(10rem, 0.8fr) minmax(14rem, 1.2fr);
  align-items: stretch;
  gap: 0.5rem;
}

.rules-disclosure {
  min-width: 0;
  padding: 0.58rem 0.68rem;
  border: 1px solid rgba(193, 155, 83, 0.26);
  border-radius: var(--radius-small);
  background: rgba(15, 18, 15, 0.66);
}

.rules-disclosure summary {
  color: var(--color-brass-bright);
  font-size: 0.62rem;
  font-weight: 850;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;
}

.rules-disclosure p {
  margin: 0.4rem 0 0;
  color: var(--color-text-muted);
  font-size: 0.58rem;
  line-height: 1.35;
}

@media (max-width: 900px) {
  .home-panel { grid-template-columns: 0.48fr 1.52fr; }
}

@media (max-width: 760px) {
  .home-panel { grid-template-columns: 1fr; }
  .home-visual { display: none; }
}

@media (max-width: 520px) {
  .home-view { padding: 0.3rem; }
  .home-panel { padding: 0.42rem; }
  .home-intro p { display: none; }
  .home-footer { grid-template-columns: 1fr; }
  .rules-disclosure { display: none; }
}

@media (max-height: 620px) {
  .home-intro p,
  .rules-disclosure {
    display: none;
  }
  .home-footer { grid-template-columns: 1fr; }
}

@media (max-height: 520px) {
  .home-intro { display: none; }
  .home-content { gap: 0.24rem; }
}

@media (max-height: 420px) {
  .home-view { padding-block: 0.2rem; }
  .home-panel { padding-block: 0.35rem; }
  .home-content { gap: 0.18rem; }
  .stats-panel { display: none; }
}
</style>

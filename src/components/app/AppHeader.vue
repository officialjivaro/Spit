<template>
  <header class="app-header">
    <a class="app-header__games" href="https://jivaro.net/games" target="_top">Games</a>
    <p class="app-header__title">Sudoku</p>

    <nav class="app-header__actions" aria-label="Player services">
      <button type="button" class="header-action" @click="openRanks">
        <span aria-hidden="true">♜</span>
        <span class="header-action__label">Ranks</span>
      </button>

      <button type="button" class="header-action header-action--wallet" @click="store.open">
        <QuantaCoin />
        <span class="header-action__label">{{ economy.walletLabel.value }}</span>
        <strong>{{ economy.balance.value }}</strong>
      </button>

      <button type="button" class="header-action" @click="account.openModal">
        <span aria-hidden="true">{{ account.isAuthenticated.value ? '●' : '○' }}</span>
        <span class="header-action__label">{{ account.isAuthenticated.value ? account.displayName.value : 'Sign In' }}</span>
      </button>
    </nav>
  </header>
</template>

<script setup>
import { useEconomy } from '../../composables/useEconomy.js'
import { useOnlineAccount } from '../../composables/useOnlineAccount.js'
import { useSudokuLeaderboard } from '../../composables/useSudokuLeaderboard.js'
import { useSudokuStore } from '../../composables/useSudokuStore.js'
import QuantaCoin from '../common/QuantaCoin.vue'

const account = useOnlineAccount()
const economy = useEconomy()
const leaderboard = useSudokuLeaderboard()
const store = useSudokuStore()

async function openRanks() {
  await leaderboard.open({ mode: 'classic', difficulty: 'easy' })
}
</script>

<style scoped>
.app-header {
  position: relative;
  z-index: 5;
  display: grid;
  grid-template-columns: minmax(4rem, 1fr) auto minmax(4rem, 1fr);
  align-items: center;
  inline-size: 100%;
  block-size: var(--app-header-size);
  padding-inline: clamp(0.45rem, 1.4vw, 1rem);
  border-block-end: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(35, 32, 35, 0.94);
  box-shadow: 0 0.35rem 1rem rgba(0, 0, 0, 0.22);
  backdrop-filter: blur(10px);
}

.app-header__title {
  grid-column: 2;
  margin: 0;
  color: #fff;
  font-size: clamp(1.3rem, 3vmin, 2.1rem);
  font-weight: 850;
  letter-spacing: 0.08em;
  text-shadow: 0 0 0.55rem rgba(255, 148, 174, 0.5), 0.12rem 0.12rem 0 rgba(0, 0, 0, 0.65);
}

.app-header__games {
  justify-self: start;
  display: inline-grid;
  place-items: center;
  min-block-size: 2.2rem;
  padding-inline: clamp(0.7rem, 1.5vw, 1rem);
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: var(--radius-small);
  background: linear-gradient(145deg, var(--color-pink-light), var(--color-pink));
  color: #fff;
  font-size: clamp(0.68rem, 1.5vmin, 0.92rem);
  font-weight: 850;
  text-decoration: none;
  text-shadow: 0.08rem 0.08rem 0 rgba(35, 25, 30, 0.7);
  box-shadow: 0 0.2rem 0 var(--color-pink-shadow), 0 0.35rem 0.8rem rgba(0, 0, 0, 0.2);
  transition: transform 160ms ease, filter 160ms ease;
}

.app-header__actions {
  grid-column: 3;
  justify-self: end;
  display: flex;
  align-items: center;
  gap: clamp(0.25rem, 0.7vw, 0.5rem);
  min-inline-size: 0;
}

.header-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.32rem;
  min-block-size: 2.2rem;
  padding: 0.35rem clamp(0.45rem, 1vw, 0.72rem);
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: var(--radius-small);
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  font-size: clamp(0.65rem, 1.3vmin, 0.84rem);
  font-weight: 820;
  cursor: pointer;
  transition: background 150ms ease, transform 150ms ease;
}

.header-action:hover {
  background: rgba(255, 255, 255, 0.16);
  transform: translateY(-0.08rem);
}

.header-action--wallet strong {
  color: #ffe39b;
  font-size: 0.9rem;
}

.app-header__games:focus-visible,
.header-action:focus-visible {
  outline: 3px solid var(--color-pink-light);
  outline-offset: 2px;
}

@media (max-width: 48rem) {
  .app-header {
    grid-template-columns: auto 1fr auto;
  }

  .app-header__title {
    justify-self: center;
    font-size: clamp(1.1rem, 4vw, 1.6rem);
  }

  .header-action__label {
    display: none;
  }
}

@media (max-width: 28rem) {
  .app-header__title {
    display: none;
  }

  .app-header {
    grid-template-columns: auto 1fr;
  }

  .app-header__actions {
    grid-column: 2;
  }
}
</style>

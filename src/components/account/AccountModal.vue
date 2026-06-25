<template>
  <Transition name="modal-fade">
    <div v-if="account.state.modalOpen" class="account-overlay" role="presentation" @click.self="close">
      <section class="account-modal glass-panel" role="dialog" aria-modal="true" aria-labelledby="account-title">
        <button class="modal-close" type="button" aria-label="Close account panel" @click="close">×</button>

        <header class="account-heading">
          <span>Shared Jivaro Account</span>
          <h2 id="account-title">{{ account.isAuthenticated.value ? 'Player Profile' : 'Save Scores & Quanta' }}</h2>
          <p v-if="!account.isAuthenticated.value">
            Sign in with a one-time email code. The same account is used across participating Jivaro games.
          </p>
        </header>

        <div v-if="!account.state.configured" class="account-notice" role="status">
          <strong>Supabase is not configured.</strong>
          <span>Add the shared Jivaro Games project URL and publishable key to <code>.env.local</code>.</span>
        </div>

        <template v-else-if="account.isAuthenticated.value">
          <div class="account-details">
            <span>Signed in as</span>
            <strong>{{ account.email.value }}</strong>
          </div>

          <form class="account-form" @submit.prevent="saveDisplayName">
            <label for="display-name">Leaderboard display name</label>
            <input
              id="display-name"
              v-model.trim="displayNameInput"
              type="text"
              minlength="3"
              maxlength="24"
              autocomplete="nickname"
              required
            />
            <small>3–24 characters. Your email is never shown publicly.</small>
            <AppButton type="submit" :disabled="account.state.loading">
              {{ account.state.loading ? 'Saving…' : 'Save Display Name' }}
            </AppButton>
          </form>

          <AppButton variant="quiet" :disabled="account.state.loading" @click="signOut">
            Sign Out
          </AppButton>
        </template>

        <template v-else>
          <form v-if="step === 'email'" class="account-form" @submit.prevent="sendCode">
            <label for="account-email">Email address</label>
            <input
              id="account-email"
              v-model.trim="emailInput"
              type="email"
              autocomplete="email"
              placeholder="player@example.com"
              required
            />
            <small>New email addresses automatically create a shared Jivaro account.</small>
            <AppButton type="submit" :disabled="account.state.loading">
              {{ account.state.loading ? 'Sending…' : 'Email Me a Code' }}
            </AppButton>
          </form>

          <form v-else class="account-form" @submit.prevent="verifyCode">
            <div class="code-sent">
              <span>Code sent to</span>
              <strong>{{ emailInput }}</strong>
            </div>
            <label for="account-code">Sign-in code</label>
            <input
              id="account-code"
              v-model="tokenInput"
              class="otp-input"
              type="text"
              inputmode="numeric"
              autocomplete="one-time-code"
              placeholder="Enter the code"
              required
            />
            <AppButton type="submit" :disabled="account.state.loading">
              {{ account.state.loading ? 'Checking…' : 'Sign In' }}
            </AppButton>
            <button class="text-button" type="button" :disabled="account.state.loading" @click="step = 'email'">
              Use a different email
            </button>
          </form>
        </template>

        <p v-if="account.state.error" class="account-error" role="alert">{{ account.state.error }}</p>
        <p v-if="account.state.message" class="account-success" role="status">{{ account.state.message }}</p>
      </section>
    </div>
  </Transition>
</template>

<script setup>
import { onBeforeUnmount, ref, watch } from 'vue'
import { useOnlineAccount } from '../../composables/useOnlineAccount.js'
import AppButton from '../ui/AppButton.vue'

const account = useOnlineAccount()
const step = ref('email')
const emailInput = ref('')
const tokenInput = ref('')
const displayNameInput = ref('')

watch(
  () => account.state.modalOpen,
  open => {
    if (!open) return
    step.value = account.isAuthenticated.value ? 'account' : 'email'
    tokenInput.value = ''
    displayNameInput.value = account.state.profile?.display_name || ''
    window.addEventListener('keydown', handleKeydown)
  }
)

watch(
  () => account.state.profile?.display_name,
  value => {
    if (value) displayNameInput.value = value
  },
  { immediate: true }
)

onBeforeUnmount(() => window.removeEventListener('keydown', handleKeydown))

function close() {
  account.closeModal()
  window.removeEventListener('keydown', handleKeydown)
}

function handleKeydown(event) {
  if (event.key === 'Escape') close()
}

async function sendCode() {
  if (await account.requestOtp(emailInput.value)) step.value = 'code'
}

async function verifyCode() {
  if (await account.verifyOtp(emailInput.value, tokenInput.value)) step.value = 'account'
}

async function saveDisplayName() {
  await account.saveDisplayName(displayNameInput.value)
}

async function signOut() {
  await account.signOut()
  step.value = 'email'
}
</script>

<style scoped>
.account-overlay {
  position: fixed;
  z-index: 80;
  inset: 0;
  display: grid;
  place-items: center;
  padding: clamp(0.65rem, 3vw, 2rem);
  background: rgba(24, 18, 22, 0.68);
  backdrop-filter: blur(9px);
}

.account-modal {
  position: relative;
  display: grid;
  gap: 1rem;
  inline-size: min(31rem, 100%);
  max-block-size: 92dvh;
  padding: clamp(1rem, 3vw, 1.8rem);
  overflow: auto;
}

.modal-close {
  position: absolute;
  z-index: 2;
  inset-block-start: 0.7rem;
  inset-inline-end: 0.75rem;
  inline-size: 2.4rem;
  block-size: 2.4rem;
  border: 1px solid rgba(52, 44, 48, 0.28);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.82);
  color: var(--color-ink);
  font-size: 1.65rem;
  cursor: pointer;
}

.account-heading {
  padding-inline-end: 2.5rem;
}

.account-heading span,
.account-details span,
.account-form label,
.code-sent span {
  color: var(--color-pink-shadow);
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.account-heading h2 {
  margin: 0.3rem 0 0.45rem;
  color: var(--color-ink);
  font-size: clamp(1.55rem, 5vw, 2.35rem);
}

.account-heading p,
.account-form small,
.account-notice span {
  margin: 0;
  color: rgba(37, 33, 36, 0.72);
  font-size: 0.82rem;
  line-height: 1.45;
}

.account-details,
.code-sent,
.account-notice {
  display: grid;
  gap: 0.25rem;
  padding: 0.8rem;
  border: 1px solid rgba(189, 112, 133, 0.24);
  border-radius: var(--radius-small);
  background: rgba(255, 255, 255, 0.66);
}

.account-form {
  display: grid;
  gap: 0.55rem;
}

.account-form input {
  inline-size: 100%;
  min-block-size: 2.85rem;
  padding: 0.65rem 0.75rem;
  border: 2px solid rgba(189, 112, 133, 0.42);
  border-radius: var(--radius-small);
  background: rgba(255, 255, 255, 0.88);
  color: var(--color-ink);
}

.otp-input {
  font-size: 1.35rem;
  font-weight: 900;
  letter-spacing: 0.2em;
  text-align: center;
}

.text-button {
  border: 0;
  background: transparent;
  color: #7b3c50;
  font-weight: 800;
  cursor: pointer;
}

.account-error,
.account-success {
  margin: 0;
  font-size: 0.84rem;
  font-weight: 800;
  text-align: center;
}

.account-error {
  color: #8b243b;
}

.account-success {
  color: #326447;
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

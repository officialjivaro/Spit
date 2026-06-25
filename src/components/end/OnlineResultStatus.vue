<template>
  <section class="online-result" aria-label="Online result and Quanta reward">
    <div class="online-result__wallet">
      <QuantaCoin size="medium" />
      <div>
        <span>{{ economy.walletLabel.value }}</span>
        <strong>{{ economy.balance.value.toLocaleString() }}</strong>
      </div>
    </div>

    <div class="online-result__copy">
      <p v-if="submitting">Verifying the result and checking Quanta rewards…</p>
      <p v-else-if="error" class="online-result__error">{{ error }}</p>
      <p v-else-if="message">{{ message }}</p>
      <p v-else-if="!authenticated">Guest results stay local. Sign in before the next game to join rankings.</p>
      <p v-else>Online verification is ready for the next ranked result.</p>

      <strong v-if="rewardAmount > 0" class="online-result__reward">+{{ rewardAmount }} Quanta</strong>
    </div>

    <AppButton v-if="!authenticated" size="small" @click="account.openModal">Sign In</AppButton>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useEconomy } from '../../composables/useEconomy.js'
import { useOnlineAccount } from '../../composables/useOnlineAccount.js'
import AppButton from '../ui/AppButton.vue'
import QuantaCoin from '../common/QuantaCoin.vue'

const props = defineProps({
  submitting: {
    type: Boolean,
    default: false
  },
  message: {
    type: String,
    default: ''
  },
  error: {
    type: String,
    default: ''
  }
})

const account = useOnlineAccount()
const economy = useEconomy()
const authenticated = computed(() => account.isAuthenticated.value)
const rewardAmount = computed(() => Number(economy.state.lastReward?.amount || 0))
</script>

<style scoped>
.online-result {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
  inline-size: 100%;
  padding: 0.65rem 0.8rem;
  border: 1px solid rgba(183, 119, 25, 0.24);
  border-radius: var(--radius-medium);
  background: rgba(255, 249, 226, 0.76);
}

.online-result__wallet {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 0 0 auto;
}

.online-result__wallet span,
.online-result__wallet strong {
  display: block;
}

.online-result__wallet span {
  color: #805416;
  font-size: 0.58rem;
  font-weight: 900;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.online-result__wallet strong {
  color: #5f3b07;
  font-size: 1.1rem;
}

.online-result__copy {
  min-inline-size: 0;
  flex: 1;
}

.online-result__copy p {
  margin: 0;
  color: rgba(75, 52, 22, 0.82);
  font-size: 0.75rem;
  font-weight: 750;
}

.online-result__error {
  color: #8b243b !important;
}

.online-result__reward {
  display: block;
  margin-block-start: 0.16rem;
  color: #9a6416;
  font-size: 0.9rem;
}

@media (max-width: 34rem) {
  .online-result {
    flex-wrap: wrap;
    text-align: center;
  }

  .online-result__copy {
    flex-basis: 100%;
    order: 3;
  }
}
</style>

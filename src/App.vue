<template>
  <div class="app-shell">
    <a class="skip-link" href="#main-content">Skip to game</a>
    <CherryBlossomBackground />
    <AppHeader />
    <main id="main-content" ref="mainContent" class="app-main" tabindex="-1">
      <RouterView v-slot="{ Component, route: activeRoute }">
        <Transition name="page" mode="out-in">
          <component :is="Component" :key="activeRoute.name" />
        </Transition>
      </RouterView>
    </main>

    <AccountModal />
    <LeaderboardModal />
    <SudokuStoreModal />
  </div>
</template>

<script setup>
import { nextTick, onMounted, ref, watch } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import AccountModal from './components/account/AccountModal.vue'
import AppHeader from './components/app/AppHeader.vue'
import CherryBlossomBackground from './components/background/CherryBlossomBackground.vue'
import LeaderboardModal from './components/leaderboard/LeaderboardModal.vue'
import SudokuStoreModal from './components/store/SudokuStoreModal.vue'
import { useEconomy } from './composables/useEconomy.js'
import { useOnlineAccount } from './composables/useOnlineAccount.js'
import { useSudokuStore } from './composables/useSudokuStore.js'

const route = useRoute()
const mainContent = ref(null)
const account = useOnlineAccount()
const economy = useEconomy()
const store = useSudokuStore()

watch(
  () => route.fullPath,
  async () => {
    await nextTick()
    mainContent.value?.focus({ preventScroll: true })
  }
)

watch(
  () => account.state.user?.id || '',
  async () => {
    await economy.handleAccount(account.state.user)
    await store.handleAccount(account.state.user)
  },
  { immediate: true }
)

onMounted(async () => {
  store.applyCosmetics()
  await account.initialize()
})
</script>

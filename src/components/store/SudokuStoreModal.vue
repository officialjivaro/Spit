<template>
  <Transition name="modal-fade">
    <div v-if="store.state.open" class="store-overlay" role="presentation" @click.self="close">
      <section class="store-modal glass-panel" role="dialog" aria-modal="true" aria-labelledby="store-title">
        <button class="modal-close" type="button" aria-label="Close Sakura Market" @click="close">×</button>

        <header class="store-header">
          <div>
            <span class="store-kicker">Sudoku Cosmetics</span>
            <h2 id="store-title">Sakura Market</h2>
            <p>Permanent cosmetic items. No purchase changes rankings or puzzle difficulty.</p>
          </div>

          <div class="store-wallet" :aria-label="`${economy.walletLabel.value}: ${economy.balance.value} Quanta`">
            <QuantaCoin size="medium" />
            <div>
              <span>{{ economy.walletLabel.value }}</span>
              <strong>{{ economy.balance.value.toLocaleString() }}</strong>
            </div>
          </div>
        </header>

        <p v-if="!account.isAuthenticated.value" class="store-notice">
          Guests may browse previews. Sign in to purchase, own, and equip permanent items.
        </p>

        <nav class="category-tabs" aria-label="Sakura Market categories">
          <button
            v-for="category in categories"
            :key="category.id"
            type="button"
            :class="['category-tab', { 'category-tab--active': category.id === activeCategory }]"
            :aria-pressed="category.id === activeCategory"
            @click="activeCategory = category.id"
          >
            {{ category.label }}
          </button>
        </nav>

        <div class="store-grid" tabindex="0" aria-label="Sudoku cosmetic items">
          <article v-for="item in filteredItems" :key="item.id" class="store-item">
            <div class="item-preview" :class="`item-preview--${item.category}`" :style="previewStyle(item)" aria-hidden="true">
              <span v-if="item.preview !== 'image'">{{ previewText(item) }}</span>
            </div>

            <div class="item-copy">
              <small>{{ categoryLabel(item.category) }}</small>
              <h3>{{ item.name }}</h3>
              <p>{{ item.description }}</p>
            </div>

            <div class="item-footer">
              <span class="item-price">
                <QuantaCoin />
                {{ item.price }}
              </span>
              <button
                type="button"
                :disabled="buttonState(item).disabled"
                @click="handleItemAction(item)"
              >
                {{ buttonState(item).label }}
              </button>
            </div>
          </article>
        </div>

        <footer class="store-footer">
          <span v-if="store.state.error" class="store-error" role="alert">{{ store.state.error }}</span>
          <span v-else-if="store.state.message" class="store-success" role="status">{{ store.state.message }}</span>
          <span v-else>Prices are controlled by the server. Owned items cannot be purchased twice.</span>
          <button type="button" @click="close">Return to Sudoku</button>
        </footer>
      </section>
    </div>
  </Transition>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import {
  BACKGROUND_ASSETS,
  getCategoryLabel,
  SUDOKU_STORE_CATEGORIES
} from '../../constants/sudokuStoreCatalog.js'
import { useEconomy } from '../../composables/useEconomy.js'
import { useOnlineAccount } from '../../composables/useOnlineAccount.js'
import { useSudokuStore } from '../../composables/useSudokuStore.js'
import QuantaCoin from '../common/QuantaCoin.vue'

const account = useOnlineAccount()
const economy = useEconomy()
const store = useSudokuStore()
const categories = SUDOKU_STORE_CATEGORIES
const activeCategory = ref(categories[0].id)
const filteredItems = computed(() => store.state.catalog.filter(item => item.category === activeCategory.value && item.active !== false))

watch(
  () => store.state.open,
  open => {
    if (open) window.addEventListener('keydown', handleKeydown)
    else window.removeEventListener('keydown', handleKeydown)
  }
)

onBeforeUnmount(() => window.removeEventListener('keydown', handleKeydown))

function close() {
  store.close()
}

function handleKeydown(event) {
  if (event.key === 'Escape') close()
}

function categoryLabel(categoryId) {
  return getCategoryLabel(categoryId)
}

function previewStyle(item) {
  if (item.preview === 'image') {
    const url = BACKGROUND_ASSETS[item.assetKey || item.id]
    return url ? { backgroundImage: `url("${url}")` } : {}
  }

  if (typeof item.preview === 'string' && item.preview.startsWith('#')) {
    return { background: `linear-gradient(145deg, ${item.preview}, color-mix(in srgb, ${item.preview} 55%, #2b2630))` }
  }

  return {}
}

function previewText(item) {
  if (item.category === 'numbers') return item.preview || '123'
  if (item.category === 'completion') return '✦'
  if (item.category === 'controls') return '▣'
  if (item.category === 'petals') return '❀'
  return item.name.slice(0, 1)
}

function buttonState(item) {
  const loading = store.state.actionItemId === item.id

  if (loading) return { label: 'Working…', disabled: true }
  if (store.isEquipped(item.id)) return { label: 'Equipped', disabled: true }
  if (store.isOwned(item.id)) return { label: 'Equip', disabled: false }
  if (!account.isAuthenticated.value) return { label: 'Sign In to Buy', disabled: false }
  if (economy.balance.value < item.price) return { label: `Need ${item.price - economy.balance.value} Q`, disabled: true }
  return { label: `Buy · ${item.price} Q`, disabled: false }
}

async function handleItemAction(item) {
  if (!account.isAuthenticated.value && !store.isOwned(item.id)) {
    account.openModal()
    return
  }

  if (store.isOwned(item.id)) {
    await store.equip(item.id)
    return
  }

  if (await store.purchase(item.id)) {
    await store.equip(item.id)
  }
}
</script>

<style scoped>
.store-overlay {
  position: fixed;
  z-index: 84;
  inset: 0;
  display: grid;
  place-items: center;
  padding: clamp(0.4rem, 2vw, 1.4rem);
  background: rgba(24, 18, 22, 0.74);
  backdrop-filter: blur(10px);
}

.store-modal {
  position: relative;
  display: grid;
  grid-template-rows: auto auto auto minmax(0, 1fr) auto;
  gap: clamp(0.5rem, 1.2dvh, 0.9rem);
  inline-size: min(76rem, 100%);
  max-block-size: 94dvh;
  padding: clamp(0.75rem, 2vw, 1.4rem);
  overflow: hidden;
}

.modal-close {
  position: absolute;
  z-index: 4;
  inset-block-start: 0.65rem;
  inset-inline-end: 0.7rem;
  inline-size: 2.4rem;
  block-size: 2.4rem;
  border: 1px solid rgba(52, 44, 48, 0.28);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.88);
  color: var(--color-ink);
  font-size: 1.65rem;
  cursor: pointer;
}

.store-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding-inline-end: 3rem;
}

.store-kicker {
  color: var(--color-pink-shadow);
  font-size: 0.62rem;
  font-weight: 950;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.store-header h2 {
  margin: 0.18rem 0 0.25rem;
  color: var(--color-ink);
  font-size: clamp(1.45rem, 4vw, 2.6rem);
}

.store-header p,
.store-notice {
  margin: 0;
  color: rgba(37, 33, 36, 0.7);
  font-size: clamp(0.68rem, 1vw, 0.82rem);
}

.store-wallet {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 0.65rem;
  padding: 0.55rem 0.75rem;
  border: 1px solid rgba(183, 119, 25, 0.3);
  border-radius: var(--radius-medium);
  background: rgba(255, 247, 218, 0.76);
  box-shadow: 0 0.25rem 0.8rem rgba(89, 57, 11, 0.12);
}

.store-wallet span,
.store-wallet strong {
  display: block;
}

.store-wallet span {
  color: #815818;
  font-size: 0.58rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.store-wallet strong {
  color: #5c3906;
  font-size: 1.1rem;
}

.store-notice {
  padding: 0.55rem 0.75rem;
  border-radius: var(--radius-small);
  background: rgba(255, 244, 218, 0.76);
  color: #714914;
  font-weight: 750;
  text-align: center;
}

.category-tabs {
  display: flex;
  gap: 0.35rem;
  overflow-x: auto;
  padding-block-end: 0.15rem;
}

.category-tab {
  flex: 0 0 auto;
  min-block-size: 2.2rem;
  padding: 0.4rem 0.7rem;
  border: 1px solid rgba(189, 112, 133, 0.2);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.62);
  color: rgba(37, 33, 36, 0.7);
  font-size: 0.72rem;
  font-weight: 900;
  cursor: pointer;
}

.category-tab--active {
  border-color: var(--color-pink-border);
  background: linear-gradient(145deg, var(--color-pink-light), var(--color-pink));
  color: #522331;
  box-shadow: 0 0.2rem 0 var(--color-pink-shadow);
}

.store-grid {
  min-block-size: 0;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.65rem;
  overflow-y: auto;
  padding: 0.12rem 0.15rem 0.4rem;
}

.store-item {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  gap: 0.55rem;
  min-inline-size: 0;
  padding: 0.65rem;
  border: 1px solid rgba(189, 112, 133, 0.22);
  border-radius: var(--radius-medium);
  background: rgba(255, 255, 255, 0.7);
  box-shadow: 0 0.25rem 0.8rem rgba(48, 35, 41, 0.1);
}

.item-preview {
  display: grid;
  place-items: center;
  aspect-ratio: 16 / 9;
  border: 1px solid rgba(37, 33, 36, 0.14);
  border-radius: var(--radius-small);
  background: linear-gradient(145deg, #fff7f9, #e8cbd3);
  background-position: center;
  background-size: cover;
  color: #fff;
  font-size: clamp(1.5rem, 4vw, 3rem);
  font-weight: 950;
  text-shadow: 0 2px 5px rgba(0, 0, 0, 0.58);
}

.item-preview--numbers span {
  letter-spacing: 0.08em;
}

.item-copy small {
  color: var(--color-pink-shadow);
  font-size: 0.58rem;
  font-weight: 900;
  letter-spacing: 0.07em;
  text-transform: uppercase;
}

.item-copy h3 {
  margin: 0.14rem 0 0.22rem;
  color: var(--color-ink);
  font-size: 1rem;
}

.item-copy p {
  margin: 0;
  color: rgba(37, 33, 36, 0.68);
  font-size: 0.72rem;
  line-height: 1.35;
}

.item-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.item-price {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  color: #754b0c;
  font-weight: 900;
}

.item-footer button,
.store-footer button {
  min-block-size: 2.1rem;
  padding: 0.35rem 0.65rem;
  border: 1px solid var(--color-pink-border);
  border-radius: var(--radius-small);
  background: linear-gradient(145deg, var(--color-pink-light), var(--color-pink));
  color: #532331;
  font-size: 0.7rem;
  font-weight: 900;
  cursor: pointer;
}

.item-footer button:disabled {
  cursor: not-allowed;
  filter: grayscale(0.55);
  opacity: 0.62;
}

.store-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  color: rgba(37, 33, 36, 0.68);
  font-size: 0.72rem;
}

.store-error {
  color: #8b243b;
  font-weight: 850;
}

.store-success {
  color: #326447;
  font-weight: 850;
}

@media (max-width: 62rem) {
  .store-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 44rem) {
  .store-header {
    align-items: flex-start;
  }

  .store-header p {
    display: none;
  }

  .store-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 27rem) {
  .store-grid {
    grid-template-columns: 1fr;
  }

  .store-wallet span {
    display: none;
  }
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

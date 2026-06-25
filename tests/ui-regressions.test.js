import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

function read(relativePath) {
  return readFileSync(new URL(`../${relativePath}`, import.meta.url), 'utf8')
}

// UI Regressions | Protects card visibility, pointer input, mobile layout, and AI scheduling
describe('visual card rendering regressions', () => {
  it('renders empty hand slots directly with keyboard and tap instructions', () => {
    const source = read('src/components/game/CardSlot.vue')

    expect(source).not.toContain('<Transition')
    expect(source).toContain('Press {{ slotIndex + 1 }} or tap to draw')
    expect(source).toContain('<PlayingCard')
    expect(source).toContain('v-if="card"')
    expect(source).toContain(`@click="emit('select', slotIndex)"`)
    expect(source).not.toContain('@touchend')
  })

  it('keeps a direct face-up component and a visible fallback in each center pile', () => {
    const source = read('src/components/game/CenterZone.vue')

    expect(source).not.toContain('<Transition')
    expect(source).toContain('v-if="topCard(pileNumber - 1)"')
    expect(source).toContain('class="missing-center-card"')
    expect(source).toContain(':key="topCard(pileNumber - 1).id"')
    expect(source).toContain(`@click="emit('select-pile', pileNumber - 1)"`)
    expect(source).not.toContain('@touchend')
  })
})

describe('opponent loop regression', () => {
  it('does not watch actionRevision and therefore cannot be starved by player moves', () => {
    const source = read('src/composables/useOpponentController.js')
    const watchSection = source.slice(source.indexOf('const stopWatching'), source.indexOf('onScopeDispose'))

    expect(watchSection).not.toContain('actionRevision')
    expect(source).toContain('store.performComputerTurn(decisionRandom)')
    expect(source).toContain("schedule(result?.mistake ? 'mistake-recovery' : 'normal')")
  })
})


describe('legal hint regression', () => {
  it('only marks a selected card Ready when it has a legal destination', () => {
    const source = read('src/views/GameView.vue')

    expect(source).toContain("getLegalPileIndices(store.game, 'player', selectedSlot.value).length > 0")
    expect(source).not.toContain('if (selectedSlot.value !== null) return [selectedSlot.value]')
  })
})

describe('mobile input regression', () => {
  it('uses native click activation and manipulation touch behavior', () => {
    const cardSlot = read('src/components/game/CardSlot.vue')
    const centerZone = read('src/components/game/CenterZone.vue')
    const base = read('src/assets/styles/base.css')

    expect(cardSlot).toContain('touch-action: manipulation')
    expect(centerZone).toContain('touch-action: manipulation')
    expect(base).toContain('touch-action: manipulation')
  })

  it('contains compact width and height breakpoints for iframe and phone play', () => {
    const tokens = read('src/assets/styles/tokens.css')
    const board = read('src/components/game/GameBoard.vue')

    expect(tokens).toContain('@media (max-width: 480px)')
    expect(tokens).toContain('@media (max-height: 430px)')
    expect(board).toContain('@media (max-width: 480px)')
    expect(board).toContain('@media (max-height: 430px)')
  })
})

describe('theme regression', () => {
  it('uses the industrial red, brass, parchment, and teal token palette', () => {
    const source = read('src/assets/styles/tokens.css')

    expect(source).toContain('--color-accent: #a64034')
    expect(source).toContain('--color-brass-bright: #d0ae67')
    expect(source).toContain('--color-parchment: #efe2c1')
    expect(source).toContain('--color-secondary: #3d756f')
    expect(source).not.toContain('#37d8ff')
    expect(source).not.toContain('#8a72ff')
  })
})

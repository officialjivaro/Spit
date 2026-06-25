<template>
  <div class="blossom-scene" aria-hidden="true">
    <img class="blossom-scene__image" :src="store.activeBackgroundUrl.value" alt="" />
    <div class="blossom-scene__wash"></div>
    <img
      v-for="petal in petals"
      :key="petal.id"
      class="blossom-scene__petal"
      :src="petal.image"
      alt=""
      :style="petal.style"
    />
  </div>
</template>

<script setup>
import { useSudokuStore } from '../../composables/useSudokuStore.js'
import petal1 from '../../assets/images/petals/petal-1.png'
import petal2 from '../../assets/images/petals/petal-2.png'
import petal3 from '../../assets/images/petals/petal-3.png'
import petal4 from '../../assets/images/petals/petal-4.png'

const store = useSudokuStore()
const petalImages = [petal1, petal2, petal3, petal4]
const petalCount = 28

const petals = Array.from({ length: petalCount }, (_, index) => {
  const duration = 10 + Math.random() * 10
  const delay = -(Math.random() * duration)
  const size = 18 + Math.random() * 34
  const drift = -(12 + Math.random() * 30)
  const spin = 240 + Math.random() * 560

  return {
    id: index,
    image: petalImages[Math.floor(Math.random() * petalImages.length)],
    style: {
      '--petal-left': `${Math.random() * 100}%`,
      '--petal-size': `${size}px`,
      '--petal-duration': `${duration}s`,
      '--petal-delay': `${delay}s`,
      '--petal-drift': `${drift}vw`,
      '--petal-spin': `${spin}deg`,
      '--petal-opacity': `${0.45 + Math.random() * 0.45}`
    }
  }
})
</script>

<style scoped>
.blossom-scene {
  position: absolute;
  z-index: 0;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.blossom-scene__image,
.blossom-scene__wash {
  position: absolute;
  inset: 0;
  inline-size: 100%;
  block-size: 100%;
}

.blossom-scene__image {
  object-fit: cover;
  object-position: center;
}

.blossom-scene__wash {
  background: linear-gradient(120deg, rgba(255, 255, 255, 0.24), rgba(255, 244, 247, 0.08) 50%, rgba(255, 255, 255, 0.2));
}

.blossom-scene__petal {
  position: absolute;
  inset-block-start: -10vh;
  inset-inline-start: var(--petal-left);
  inline-size: var(--petal-size);
  block-size: var(--petal-size);
  opacity: 0;
  object-fit: contain;
  will-change: transform, opacity;
  animation: petal-fall var(--petal-duration) linear var(--petal-delay) infinite;
}

@keyframes petal-fall {
  0% {
    opacity: 0;
    transform: translate3d(0, -12vh, 0) rotate(0deg);
  }

  10% {
    opacity: var(--petal-opacity);
  }

  100% {
    opacity: 0;
    transform: translate3d(var(--petal-drift), 116vh, 0) rotate(var(--petal-spin));
  }
}

@media (prefers-reduced-motion: reduce) {
  .blossom-scene__petal {
    display: none;
  }
}
</style>

<style>
:root[data-sudoku-petal-pack='moon-petals'] .blossom-scene__petal { filter: hue-rotate(40deg) saturate(0.75); }
:root[data-sudoku-petal-pack='golden-petals'] .blossom-scene__petal { filter: sepia(1) saturate(1.8) hue-rotate(345deg) brightness(1.08); }
:root[data-sudoku-petal-pack='crimson-petals'] .blossom-scene__petal { filter: saturate(1.55) hue-rotate(330deg) brightness(0.9); }
</style>

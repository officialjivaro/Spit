import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import GameView from '../views/GameView.vue'
import ResultsView from '../views/ResultsView.vue'

// Router | Uses hash history so every view works on GitHub Pages
const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/play', name: 'play', component: GameView },
    { path: '/results', name: 'results', component: ResultsView },
    { path: '/:pathMatch(.*)*', redirect: '/' }
  ]
})

export default router

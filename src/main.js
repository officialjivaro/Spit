import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router/index.js'
import './assets/styles/tokens.css'
import './assets/styles/base.css'
import './assets/styles/animations.css'

// App Entry | Registers Vue plugins and mounts the application
createApp(App).use(createPinia()).use(router).mount('#app')

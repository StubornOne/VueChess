import './assets/chess.css'
import 'floating-vue/dist/style.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import FloatingVue from 'floating-vue'

const pinia = createPinia()

createApp(App).use(FloatingVue).use(pinia).mount('#app')

import { createRouter, createWebHistory } from 'vue-router'

// Rutas de páginas
import DemoCollapsible from '@/pages/DemoCollapsible.vue'
import Despensa from '@/pages/Despensa.vue'

const routes = [
  { path: '/', name: 'home', component: DemoCollapsible },
  { path: '/despensa', name: 'despensa', component: Despensa },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior() {
    return { left: 0, top: 0 }
  },
})

export default router


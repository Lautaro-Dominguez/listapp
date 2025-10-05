import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/pages/Home.vue'
import Lists from '@/pages/Lists.vue'
import Products from '@/pages/Products.vue'
import Pantry from '@/pages/Pantry.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/listas',
    name: 'Lists',
    component: Lists
  },
  {
    path: '/productos',
    name: 'Products', 
    component: Products
  },
  {
    path: '/despensa',
    name: 'Pantry',
    component: Pantry
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
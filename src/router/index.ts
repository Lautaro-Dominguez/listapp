import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/pages/Home.vue'
import Lists from '@/pages/Lists.vue'
import Products from '@/pages/Products.vue'
import Pantry from '@/pages/Pantry.vue'
import Login from '@/pages/Login.vue'
import RecuperarContrasena from '@/pages/RecuperarContrasena.vue'
import Registro from '@/pages/Registro.vue'
import Verificacion from '@/pages/Verificacion.vue'

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
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/recuperar-contraseña',
    name: 'RecuperarContrasena',
    component: RecuperarContrasena
  },
  {
    path: '/registro',
    name: 'Registro',
    component: Registro
  },
  {
    path: '/verificacion',
    name: 'Verificacion',
    component: Verificacion
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router

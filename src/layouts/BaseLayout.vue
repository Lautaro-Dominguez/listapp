<template>
  <div class="base-layout">
    <header class="header">
      <div class="logo-section">
        <router-link to="/" class="logo-link">
          <img :src="logoUrl" alt="Logo" class="logo" />
          <span class="app-title">ListAPP</span>
        </router-link>
      </div>
      <nav class="nav">
        <router-link class="nav-link" to="/listas">Listas</router-link>
        <router-link class="nav-link" to="/productos">Productos</router-link>
        <router-link class="nav-link" to="/despensa">Despensa</router-link>
        <div class="profile-container" ref="profileRef">
          <div class="profile-section" @click="toggleProfileWindow">
            <div class="profile-img">
              <img :src="profileUrl" alt="Perfil" class="profile-avatar" />
            </div>
          </div>
          
          <!-- Ventana de perfil -->
          <div v-if="showProfileWindow" class="profile-window">
            <div class="profile-window-content">
              <div v-if="isAuthenticated" class="user-info">
                <div class="user-avatar">
                  <img :src="profileUrl" alt="Perfil" class="avatar-img" />
                </div>
                <div class="user-details">
                  <h3 class="user-name">{{ user?.name }}</h3>
                  <p class="user-email">{{ user?.email }}</p>
                </div>
                <div class="profile-actions">
                  <v-btn
                    color="error"
                    variant="outlined"
                    size="small"
                    @click="handleLogout"
                    block
                  >
                    Cerrar Sesión
                  </v-btn>
                </div>
              </div>
              <div v-else class="login-prompt">
                <p class="prompt-text">No has iniciado sesión</p>
                <v-btn
                  @click="goToLogin"
                  class="profile-login-btn"
                >
                  Iniciar Sesión
                </v-btn>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>

    <main class="main-content">
      <slot />
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import profileUrl from '@/assets/profile_logo.png'
import logoUrl from '@/assets/listapp_logo.png'

const router = useRouter()
const { user, isAuthenticated, logout, initializeAuth } = useAuth()

const showProfileWindow = ref(false)
const profileRef = ref(null)

const toggleProfileWindow = () => {
  showProfileWindow.value = !showProfileWindow.value
}

const handleLogout = () => {
  logout()
  showProfileWindow.value = false
  router.push('/')
}

const goToLogin = () => {
  showProfileWindow.value = false
  router.push('/login')
}

const handleClickOutside = (event) => {
  if (profileRef.value && !profileRef.value.contains(event.target)) {
    showProfileWindow.value = false
  }
}

onMounted(() => {
  initializeAuth()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>

/* Tipografia */
@import url('https://fonts.googleapis.com/css2?family=Crete+Round:ital,wght@0,400;1,400&display=swap');

.base-layout {
  min-height: 100vh;
  background: #e8f4e1;
  font-family: 'Crete Round', serif;
}
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #d9d9d9;
  padding: 10px 40px 10px 40px;
}
.logo-section {
  display: flex;
  align-items: center;
}
.logo-link {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: inherit;
}
.logo {
  width: 70px;
  height: 70px;
  margin-right: 16px;
}
.app-title {
  font-size: 1.5rem;
  color: #222;
}
.nav {
  display: flex;
  gap: 40px;
  align-items: center;
}
.nav-link {
  font-size: 1.1rem;
  color: #222;
  text-decoration: none;
  transition: color 0.2s;
}
.nav-link:hover,
.nav-link.router-link-active {
  color: #98ba64;
}
.profile-container {
  position: relative;
  margin-left: 20px;
}
.profile-section {
  display: flex;
  align-items: center;
  cursor: pointer;
}
.profile-img {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: none;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s;
}
.profile-img:hover {
  transform: scale(1.05);
}
.profile-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: block;
}
.profile-window {
  position: absolute;
  top: 60px;
  right: 0;
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  z-index: 1000;
  min-width: 280px;
  max-width: 320px;
}
.profile-window-content {
  padding: 20px;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.user-avatar {
  display: flex;
  justify-content: center;
}

.avatar-img {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 3px solid #98ba64;
}

.user-details {
  text-align: center;
}

.user-name {
  margin: 0 0 4px 0;
  font-size: 1.2rem;
  font-weight: 600;
  color: #2c3e50;
}

.user-email {
  margin: 0;
  font-size: 0.9rem;
  color: #6c757d;
}

.profile-actions {
  margin-top: 8px;
}

.login-prompt {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.prompt-text {
  margin: 0;
  font-size: 1rem;
  color: #6c757d;
}

.profile-login-btn {
  background-color: #8CC94F;
  color: #666666;
  text-transform: none;
  width: 100%;
}

:deep(.profile-login-btn .v-btn__content) {
  color: #666666;
}
.main-content {
  background: #e8f4e1;
  min-height: calc(100vh - 118px);
  padding: 0;
}
</style>

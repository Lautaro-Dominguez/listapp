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
              <div class="login-prompt">
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
import profileUrl from '@/assets/profile_logo.png'
import logoUrl from '@/assets/listapp_logo.png'

const router = useRouter()

const showProfileWindow = ref(false)
const profileRef = ref(null)

const toggleProfileWindow = () => {
  showProfileWindow.value = !showProfileWindow.value
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

/* Login prompt styles */
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

/* Botón de login en el profile dropdown */
.profile-login-btn {
  background-color: #8CC94F !important;
  color: #666666 !important;
  text-transform: none !important;
  font-weight: 600;
  width: 100%;
}

:deep(.profile-login-btn .v-btn__content) {
  color: #666666 !important;
}
.main-content {
  background: #e8f4e1;
  min-height: calc(100vh - 118px);
  padding: 0;
}
</style>

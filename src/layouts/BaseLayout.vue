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
        <div class="profile-section" @click="toggleProfileWindow">
          <div class="profile-img">
            <img :src="profileUrl" alt="Perfil" class="profile-avatar" />
          </div>
        </div>
      </nav>
    </header>
    
    <!-- Ventana de perfil -->
    <div v-if="showProfileWindow" class="profile-window">
      <div class="profile-window-content">
        <!-- @TODO -->
        <p>Ventana de perfil</p>
      </div>
    </div>
    
    <main class="main-content">
      <slot />
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import profileUrl from '@/assets/profile_logo.png'
import logoUrl from '@/assets/listapp_logo.png'

const showProfileWindow = ref(false)

const toggleProfileWindow = () => {
  showProfileWindow.value = !showProfileWindow.value
}
</script>

<style scoped>

/* Tipografia */
@import url('https://fonts.googleapis.com/css2?family=Crete+Round:ital,wght@0,400;1,400&display=swap');

.base-layout {
  min-height: 100vh;
  background: #F3FDEB;
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
.profile-section {
  display: flex;
  align-items: center;
  cursor: pointer;
  margin-left: 20px;
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
  position: fixed;
  top: 90px;
  right: 40px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  z-index: 1000;
  min-width: 200px;
}
.profile-window-content {
  padding: 20px;
}
.main-content {
  background: #e8f4e1;
  min-height: calc(100vh - 118px);
  padding: 0;
}
</style>

<template>
  <div class="base-layout">
    <header class="header">
      <div class="logo-section">
        <img :src="logoUrl" alt="Logo" class="logo" />
        <span class="app-title">ListAPP</span>
      </div>
      <nav class="nav">
        <a class="nav-link" href="#">Mis listas</a>
        <a class="nav-link" href="#">Mis productos</a>
        <a class="nav-link" href="#">Mi despensa</a>
      </nav>
      <div class="profile-section">
        <div class="profile-img">
          <img :src="profileUrl" alt="Perfil" class="profile-avatar" />
        </div>
      </div>
    </header>
    <main class="main-content">
      <slot />
    </main>
  </div>
</template>

<script setup>
import profileUrl from '@/assets/profile_logo.png'
import logoUrl from '@/assets/listapp_logo.png'
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
  padding: 24px 40px 24px 40px;
}
.logo-section {
  display: flex;
  align-items: center;
}
.logo {
  width: 70px;
  height: 70px;
  margin-right: 16px;
}
.app-title {
  font-size: 1.7rem;
  font-weight: bold;
  color: #222;
}
.nav {
  display: flex;
  gap: 40px;
}
.nav-link {
  font-size: 1.3rem;
  color: #222;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s;
}
.nav-link:hover {
  color: #98ba64;
}
.profile-section {
  display: flex;
  align-items: center;
}
.profile-img {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: none;
  display: flex;
  align-items: center;
  justify-content: center;
}
.profile-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: block;
}
.main-content {
  background: #e8f4e1;
  min-height: calc(100vh - 118px);
  padding: 0;
}
</style>

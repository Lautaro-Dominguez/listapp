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
              <!-- Usuario no logueado -->
              <div v-if="!authStore.isAuthenticated" class="login-prompt">
                <p class="prompt-text">No has iniciado sesión</p>
                <v-btn
                  @click="goToLogin"
                  class="profile-login-btn"
                >
                  Iniciar Sesión
                </v-btn>
              </div>
              
              <!-- Usuario logueado -->
              <div v-else class="user-profile">
                <!-- Foto y nombre -->
                <div class="profile-header">
                  <img :src="profileUrl" alt="Perfil" class="profile-header-avatar" />
                  <div class="profile-info">
                    <h3 class="user-name">{{ authStore.user?.name }} {{ authStore.user?.surname }}</h3>
                  </div>
                </div>
                
                <!-- Información secundaria -->
                <div class="profile-details">
                  <p class="profile-detail">
                    <strong>Correo electrónico:</strong> {{ authStore.user?.email }}
                  </p>
                  <p class="profile-detail">
                    <strong>Apodo:</strong> {{ getDisplayNickname() }}
                  </p>
                </div>
                
                <!-- Botón editar -->
                <v-btn
                  class="edit-profile-btn"
                  @click="editProfile"
                >
                  <v-icon size="18" icon="mdi-pencil" class="mr-2" />
                  Editar perfil
                </v-btn>
                
                <!-- Botones de acción -->
                <div class="profile-actions">
                  <v-btn
                    class="action-btn"
                    @click="changePassword"
                  >
                    Cambiar contraseña
                  </v-btn>
                  <v-btn
                    class="action-btn logout-btn"
                    @click="handleLogout"
                    :loading="isLoggingOut"
                  >
                    Cerrar sesión
                  </v-btn>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>

    <main class="main-content">
      <slot />
    </main>

    <!-- Modal de editar perfil -->
    <EditProfileForm
      v-if="showEditProfile"
      :name="authStore.user?.name || ''"
      :surname="authStore.user?.surname || ''"
      :nickname="getCurrentNickname()"
      @save="handleSaveProfile"
      @cancel="showEditProfile = false"
      ref="editProfileFormRef"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { updateUserProfile } from '@/utils/api'
import EditProfileForm from '@/components/EditProfileForm.vue'
import profileUrl from '@/assets/profile_logo.png'
import logoUrl from '@/assets/listapp_logo.png'

const router = useRouter()
const authStore = useAuthStore()

const showProfileWindow = ref(false)
const showEditProfile = ref(false)
const profileRef = ref(null)
const editProfileFormRef = ref(null)
const isLoggingOut = ref(false)

const toggleProfileWindow = async () => {
  if (!showProfileWindow.value) {
    // Al abrir la ventana
    showProfileWindow.value = true
    
    // Si el usuario está autenticado pero no tenemos sus datos, cargarlos
    if (authStore.isAuthenticated && !authStore.user) {
      try {
        await authStore.fetchUserProfile()
      } catch (error) {
        console.error('Error loading user profile:', error)
      }
    }
  } else {
    // Al cerrar la ventana
    showProfileWindow.value = false
  }
}

const goToLogin = () => {
  showProfileWindow.value = false
  router.push('/login')
}

const editProfile = () => {
  showProfileWindow.value = false
  showEditProfile.value = true
}

const changePassword = () => {
  showProfileWindow.value = false
  router.push('/cambiar-contraseña')
}

const handleLogout = async () => {
  isLoggingOut.value = true
  try {
    await authStore.performLogout()
    showProfileWindow.value = false
    router.push('/')
  } catch (error) {
    console.error('Error during logout:', error)
  } finally {
    isLoggingOut.value = false
  }
}

// Función para obtener el apodo con debugging
const getDisplayNickname = () => {
  const user = authStore.user
  
  if (!user) return 'Sin apodo'
  if (!user.metadata) return 'Sin apodo'
  
  // El apodo se guarda como 'apodo' no como 'nickname'
  const nickname = user.metadata.apodo || user.metadata.nickname || user.metadata.nick || user.metadata.alias
  
  return nickname || 'Sin apodo'
}

// Función para obtener el apodo actual (sin texto de fallback para el modal)
const getCurrentNickname = () => {
  const user = authStore.user
  if (!user || !user.metadata) return ''
  
  return user.metadata.apodo || user.metadata.nickname || user.metadata.nick || user.metadata.alias || ''
}

// Manejar guardado del perfil
const handleSaveProfile = async (profileData) => {
  try {
    const apiData = {
      name: profileData.name,
      surname: profileData.surname,
      metadata: {
        apodo: profileData.nickname
      }
    }
    
    const updatedUser = await updateUserProfile(apiData)
    authStore.setUser(updatedUser)
    showEditProfile.value = false
  } catch (error) {
    console.error('Error updating profile:', error)
    
    // Resetear loading en el modal
    if (editProfileFormRef.value) {
      editProfileFormRef.value.resetLoading()
    }
    
    // Manejar errores específicos
    let errorMessage = 'Error al actualizar perfil'
    if (error?.status === 400) {
      errorMessage = 'Datos inválidos. Verifique la información ingresada'
    } else if (error?.status === 401) {
      errorMessage = 'No autorizado. Por favor inicie sesión nuevamente'
      authStore.clearAuth()
      showEditProfile.value = false
      router.push('/login')
      return
    } else if (error?.status === 404) {
      errorMessage = 'Perfil no encontrado'
    } else if (error?.message) {
      errorMessage = error.message
    }
    
    alert(errorMessage)
  }
}

const handleClickOutside = (event) => {
  if (profileRef.value && !profileRef.value.contains(event.target)) {
    showProfileWindow.value = false
  }
}

onMounted(async () => {
  document.addEventListener('click', handleClickOutside)
  // Inicializar el estado de autenticación de forma no bloqueante
  try {
    await authStore.initializeAuth()
  } catch (error) {
    console.error('Error initializing auth:', error)
  }
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
  width: 380px;
  min-height: 200px;
}
.profile-window-content {
  padding: 20px;
  min-height: 160px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

/* Login prompt styles */
.login-prompt {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 16px;
  justify-content: center;
  flex: 1;
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
  font-weight: normal;
  width: 100%;
  height: 40px;
}

:deep(.profile-login-btn .v-btn__content) {
  color: #666666 !important;
}

/* User Profile Styles */
.user-profile {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.profile-header-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
}

.profile-info {
  flex: 1;
}

.user-name {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
}

.profile-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 8px 0;
}

.profile-detail {
  margin: 0;
  font-size: 0.9rem;
  color: #555;
  line-height: 1.4;
}

.profile-detail strong {
  color: #333;
}

.edit-profile-btn {
  background-color: #8CC94F !important;
  color: #666666 !important;
  text-transform: none !important;
  font-weight: normal;
  width: 100%;
  height: 40px;
}

:deep(.edit-profile-btn .v-btn__content) {
  color: #666666 !important;
}

.profile-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.action-btn {
  flex: 1;
  background-color: #8CC94F !important;
  color: #666666 !important;
  text-transform: none !important;
  font-weight: normal;
  font-size: 0.85rem;
  height: 40px;
}

:deep(.action-btn .v-btn__content) {
  color: #666666 !important;
}

.logout-btn {
  background-color: #dc3545 !important;
  color: white !important;
}

:deep(.logout-btn .v-btn__content) {
  color: white !important;
}

.main-content {
  background: #e8f4e1;
  min-height: calc(100vh - 118px);
  padding: 0;
}
</style>

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface User {
  id?: string
  name?: string
  surname?: string
  email?: string
}

export const useAuthStore = defineStore('auth', () => {
  // State
  const token = ref<string | null>(localStorage.getItem('auth-token'))
  const user = ref<User | null>(null)

  // Getters
  const isAuthenticated = computed(() => !!token.value)

  // Actions
  const setToken = (newToken: string) => {
    token.value = newToken
    localStorage.setItem('auth-token', newToken)
  }

  const setUser = (userData: User) => {
    user.value = userData
  }

  const logout = () => {
    token.value = null
    user.value = null
    localStorage.removeItem('auth-token')
  }

  const clearAuth = () => {
    logout()
  }

  // Initialize auth state from localStorage
  const initializeAuth = () => {
    const storedToken = localStorage.getItem('auth-token')
    if (storedToken) {
      token.value = storedToken
      // Here you could also fetch user data from API using the token
    }
  }

  return {
    // State
    token,
    user,
    // Getters
    isAuthenticated,
    // Actions
    setToken,
    setUser,
    logout,
    clearAuth,
    initializeAuth
  }
})
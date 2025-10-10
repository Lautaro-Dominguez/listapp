import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getUserProfile, logoutUser, updateUserProfile } from '@/utils/api'

interface User {
  id?: string | number
  name?: string
  surname?: string
  email?: string
  metadata?: any
  updatedAt?: string
  createdAt?: string
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

  // Fetch user profile data
  const fetchUserProfile = async () => {
    try {
      if (!token.value) return null
      const userData = await getUserProfile()
      setUser(userData)
      return userData
    } catch (error) {
      console.error('Error fetching user profile:', error)
      // If token is invalid, clear auth
      clearAuth()
      throw error
    }
  }

  // Logout with API call
  const performLogout = async () => {
    try {
      await logoutUser()
    } catch (error) {
      console.error('Error logging out:', error)
    } finally {
      // Always clear local state regardless of API response
      clearAuth()
    }
  }

  // Update user profile
  const updateProfile = async (profileData: { name: string, surname: string, nickname: string }) => {
    try {
      const updatedUser = await updateUserProfile({
        name: profileData.name,
        surname: profileData.surname,
        metadata: {
          apodo: profileData.nickname
        }
      })
      setUser(updatedUser)
      return updatedUser
    } catch (error) {
      console.error('Error updating profile:', error)
      throw error
    }
  }

  // Initialize auth state from localStorage
  const initializeAuth = async () => {
    const storedToken = localStorage.getItem('auth-token')
    if (storedToken) {
      token.value = storedToken
      try {
        await fetchUserProfile()
      } catch (error) {
        // If profile fetch fails, token might be invalid
        clearAuth()
      }
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
    initializeAuth,
    fetchUserProfile,
    performLogout,
    updateProfile
  }
})
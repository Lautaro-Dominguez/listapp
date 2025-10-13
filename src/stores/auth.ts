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
  const token = ref<string | null>(localStorage.getItem('auth-token'))
  const user = ref<User | null>(null)

  const isAuthenticated = computed(() => !!token.value)

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

  const fetchUserProfile = async () => {
    try {
      if (!token.value) return null
      const userData = await getUserProfile()
      setUser(userData)
      return userData
    } catch (error) {
      console.error('Error fetching user profile:', error)
      clearAuth()
      throw error
    }
  }

  const performLogout = async () => {
    try {
      await logoutUser()
    } catch (error) {
      console.error('Error logging out:', error)
    } finally {
      clearAuth()
    }
  }

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

  const initializeAuth = async () => {
    const storedToken = localStorage.getItem('auth-token')
    if (storedToken) {
      token.value = storedToken
      try {
        await fetchUserProfile()
      } catch (error) {
        clearAuth()
      }
    }
  }

  return {
    token,
    user,
    isAuthenticated,
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
import { ref, computed } from 'vue'

// User interface
interface User {
  id: string
  email: string
  name: string
}

// Reactive state
const user = ref<User | null>(null)
const isLoading = ref(false)

// Computed properties
const isAuthenticated = computed(() => !!user.value)

// Auth functions
export const useAuth = () => {
  const login = async (email: string, password: string): Promise<boolean> => {
    isLoading.value = true
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Basic validation - in a real app, this would be handled by your backend
      if (email && password.length >= 6) {
        // Mock user data
        user.value = {
          id: '1',
          email: email,
          name: email.split('@')[0] || 'Usuario'
        }
        
        // Store in localStorage for persistence
        localStorage.setItem('user', JSON.stringify(user.value))
        
        return true
      }
      
      return false
    } catch (error) {
      console.error('Login error:', error)
      return false
    } finally {
      isLoading.value = false
    }
  }

  const logout = () => {
    user.value = null
    localStorage.removeItem('user')
  }

  const initializeAuth = () => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      try {
        user.value = JSON.parse(storedUser)
      } catch (error) {
        console.error('Error parsing stored user:', error)
        localStorage.removeItem('user')
      }
    }
  }

  return {
    user: computed(() => user.value),
    isAuthenticated,
    isLoading: computed(() => isLoading.value),
    login,
    logout,
    initializeAuth
  }
}
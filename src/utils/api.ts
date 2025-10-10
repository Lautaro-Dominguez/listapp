// API Base URL Configuration
export const API_BASE_URL = 'http://localhost:8000'

// API Endpoints
export const API_ENDPOINTS = {
  REGISTER: '/api/users/register',
  VERIFY_ACCOUNT: '/api/users/verify-account',
  LOGIN: '/api/users/login'
}

// Helper function to build full API URLs
export const buildApiUrl = (endpoint: string): string => {
  return `${API_BASE_URL}${endpoint}`
}
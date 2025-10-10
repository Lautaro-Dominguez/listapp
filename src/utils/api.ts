// API Base URL Configuration
export const API_BASE_URL = 'http://localhost:8080'

// API Endpoints
export const API_ENDPOINTS = {
  REGISTER: '/api/users/register',
  VERIFY_ACCOUNT: '/api/users/verify-account',
  LOGIN: '/api/users/login',
  PROFILE: '/api/users/profile',
  LOGOUT: '/api/users/logout',
  CHANGE_PASSWORD: '/api/users/change-password',
  FORGOT_PASSWORD: '/api/users/forgot-password',
  RESET_PASSWORD: '/api/users/reset-password',
  SEND_VERIFICATION: '/api/users/send-verification',
  PRODUCTS: '/api/products',
  CATEGORIES: '/api/categories'
}

// Helper function to build full API URLs
export const buildApiUrl = (endpoint: string): string => {
  return `${API_BASE_URL}${endpoint}`
}

export async function apiRequest<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('auth-token')
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  }
  
  const res = await fetch(buildApiUrl(endpoint), {
    ...options,
    headers: { ...headers, ...(options.headers || {}) }
  })
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: 'API error' }))
    errorData.status = res.status
    throw errorData
  }
  
  return res.json()
}

export async function getProducts(params: Record<string, any> = {}) {
  const url = new URL(buildApiUrl(API_ENDPOINTS.PRODUCTS))
  Object.entries(params).forEach(([k, v]) => url.searchParams.append(k, v))
  return apiRequest(url.pathname + url.search, { method: 'GET' })
}

export async function createProduct(data: any) {
  return apiRequest(API_ENDPOINTS.PRODUCTS, {
    method: 'POST',
    body: JSON.stringify(data)
  })
}

export async function updateProduct(id: number, data: any) {
  return apiRequest(`${API_ENDPOINTS.PRODUCTS}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  })
}

export async function deleteProduct(id: number) {
  return apiRequest(`${API_ENDPOINTS.PRODUCTS}/${id}`, {
    method: 'DELETE' })
}

export async function getCategories(params: Record<string, any> = {}) {
  const url = new URL(buildApiUrl(API_ENDPOINTS.CATEGORIES))
  Object.entries(params).forEach(([k, v]) => url.searchParams.append(k, String(v)))
  return apiRequest(url.pathname + url.search, { method: 'GET' })
}

export async function createCategory(data: any) {
  return apiRequest(API_ENDPOINTS.CATEGORIES, {
    method: 'POST',
    body: JSON.stringify(data)
  })
}

export async function updateCategory(id: number, data: any) {
  return apiRequest(`${API_ENDPOINTS.CATEGORIES}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  })
}

export async function deleteCategory(id: number) {
  return apiRequest(`${API_ENDPOINTS.CATEGORIES}/${id}`, { method: 'DELETE' })
}

// User Profile API
export async function getUserProfile() {
  return apiRequest(API_ENDPOINTS.PROFILE, {
    method: 'GET'
  })
}

export async function logoutUser() {
  return apiRequest(API_ENDPOINTS.LOGOUT, {
    method: 'POST'
  })
}

export async function changePassword(currentPassword: string, newPassword: string) {
  return apiRequest(API_ENDPOINTS.CHANGE_PASSWORD, {
    method: 'POST',
    body: JSON.stringify({
      currentPassword,
      newPassword
    })
  })
}

export async function updateUserProfile(profileData: { name: string, surname: string, metadata: any }) {
  return apiRequest(API_ENDPOINTS.PROFILE, {
    method: 'PUT',
    body: JSON.stringify(profileData)
  })
}

export async function forgotPassword(email: string) {
  const url = new URL(buildApiUrl(API_ENDPOINTS.FORGOT_PASSWORD))
  url.searchParams.append('email', email)
  return apiRequest(url.pathname + url.search, {
    method: 'POST'
  })
}

export async function resetPassword(code: string, password: string) {
  return apiRequest(API_ENDPOINTS.RESET_PASSWORD, {
    method: 'POST',
    body: JSON.stringify({ code, password })
  })
}

export async function sendVerificationCode(email: string) {
  const url = new URL(buildApiUrl(API_ENDPOINTS.SEND_VERIFICATION))
  url.searchParams.append('email', email)
  return apiRequest(url.pathname + url.search, {
    method: 'POST'
  })
}

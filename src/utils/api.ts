// API Base URL Configuration
export const API_BASE_URL = 'http://localhost:8080'

// API Endpoints
export const API_ENDPOINTS = {
  REGISTER: '/api/users/register',
  VERIFY_ACCOUNT: '/api/users/verify-account',
  LOGIN: '/api/users/login',
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
  if (!res.ok) throw await res.json().catch(() => ({ message: 'API error' }))
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

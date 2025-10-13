export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080').replace(/\/$/, '')

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
  CATEGORIES: '/api/categories',
  PANTRIES: '/api/pantries',
  PANTRY_ITEMS: '/api/pantries',
  SHOPPING_LISTS: '/api/shopping-lists'
}

export const buildApiUrl = (endpoint: string): string => {
  if (/^https?:\/\//i.test(endpoint)) return endpoint
  if (!API_BASE_URL) return endpoint
  return `${API_BASE_URL}${endpoint}`
}

async function parseJsonSafe(res: Response): Promise<any> {
  if (res.status === 204) return null
  const ctype = (res.headers.get('content-type') || '').toLowerCase()
  if (ctype.includes('application/json')) {
    try { return await res.json() } catch { /* fallthrough to text */ }
  }
  try {
    const text = await res.text()
    const trimmed = text.trim()
    if (!trimmed) return null
    if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
      try { return JSON.parse(trimmed) } catch { /* return raw text below */ }
    }
    return text
  } catch {
    return null
  }
}

function toErrorObject(err: any, status?: number) {
  if (err && typeof err === 'object') {
    return { ...err, status: status ?? (err.status ?? 500) }
  }
  return { message: typeof err === 'string' ? err : 'API error', status: status ?? 500 }
}

function normalizeArrayResponse<T = any>(payload: any): T[] {
  if (!payload) return []
  if (Array.isArray(payload)) return payload as T[]
  if (Array.isArray(payload.data)) return payload.data as T[]
  return []
}

function normalizePaginatedResponse<T = any>(payload: any): { data: T[]; meta?: any } {
  if (!payload) return { data: [] }
  if (Array.isArray(payload)) return { data: payload }
  if (Array.isArray(payload.data)) {
    return { data: payload.data, meta: payload.meta ?? payload.pagination }
  }
  return { data: [] }
}

const __serialQueues: Record<string, Promise<any>> = {}
function enqueueSerial<T>(key: string, task: () => Promise<T>): Promise<T> {
  const last = __serialQueues[key] || Promise.resolve()
  const next = last.catch(() => undefined).then(task)
  __serialQueues[key] = next.then(
    () => undefined,
    () => undefined
  )
  return next
}

export async function apiRequest<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('auth-token')
  const method = (options.method || 'GET').toUpperCase()
  const isBodyMethod = method !== 'GET' && method !== 'HEAD'
  const defaultHeaders: Record<string, string> = {
    Accept: 'application/json',
    ...(isBodyMethod ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  }

  const res = await fetch(buildApiUrl(endpoint), {
    ...options,
    headers: { ...defaultHeaders, ...(options.headers as any || {}) }
  })

  const payload = await parseJsonSafe(res)

  if (!res.ok) {
    throw toErrorObject(payload ?? { message: 'API error' }, res.status)
  }

  return payload as T
}

export async function getProducts(params: Record<string, any> = {}) {
  const url = new URL(buildApiUrl(API_ENDPOINTS.PRODUCTS))
  Object.entries(params).forEach(([k, v]) => url.searchParams.append(k, String(v)))
  const result = await apiRequest(url.pathname + url.search, { method: 'GET' })
  return normalizeArrayResponse(result)
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
  const result = await apiRequest(url.pathname + url.search, { method: 'GET' })
  return normalizeArrayResponse(result)
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

export async function getPantries(params: Record<string, any> = {}) {
  const url = new URL(buildApiUrl(API_ENDPOINTS.PANTRIES))
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null) {
      url.searchParams.append(k, String(v))
    }
  })
  const result = await apiRequest(url.pathname + url.search, { method: 'GET' })
  return normalizePaginatedResponse(result)
}

export async function createPantry(data: { name: string; metadata?: any }) {
  return apiRequest(API_ENDPOINTS.PANTRIES, {
    method: 'POST',
    body: JSON.stringify(data)
  })
}

export async function getPantryById(id: number) {
  return apiRequest(`${API_ENDPOINTS.PANTRIES}/${id}`, {
    method: 'GET'
  })
}

export async function updatePantry(id: number, data: { name?: string; metadata?: any }) {
  return apiRequest(`${API_ENDPOINTS.PANTRIES}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  })
}

export async function deletePantry(id: number) {
  return apiRequest(`${API_ENDPOINTS.PANTRIES}/${id}`, {
    method: 'DELETE'
  })
}

export async function sharePantry(id: number, email: string) {
  return apiRequest(`${API_ENDPOINTS.PANTRIES}/${id}/share`, {
    method: 'POST',
    body: JSON.stringify({ email })
  })
}

export async function getSharedUsers(id: number) {
  return apiRequest(`${API_ENDPOINTS.PANTRIES}/${id}/shared-users`, {
    method: 'GET'
  })
}

export async function revokeSharePantry(pantryId: number, userId: number) {
  return apiRequest(`${API_ENDPOINTS.PANTRIES}/${pantryId}/share/${userId}`, {
    method: 'DELETE'
  })
}
export async function getPantryItems(pantryId: number, params: Record<string, any> = {}) {
  const url = new URL(buildApiUrl(`${API_ENDPOINTS.PANTRY_ITEMS}/${pantryId}/items`))
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null) {
      url.searchParams.append(k, String(v))
    }
  })
  return enqueueSerial('pantry-items', async () => {
    const result = await apiRequest(url.pathname + url.search, { method: 'GET' })
    return normalizePaginatedResponse(result)
  })
}

export async function createPantryItem(pantryId: number, data: any) {
  return enqueueSerial(`pantry-write-${pantryId}`, async () => {
    return apiRequest(`${API_ENDPOINTS.PANTRY_ITEMS}/${pantryId}/items`, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  })
}

export async function updatePantryItem(pantryId: number, itemId: number, data: any) {
  return enqueueSerial(`pantry-write-${pantryId}`, async () => {
    return apiRequest(`${API_ENDPOINTS.PANTRY_ITEMS}/${pantryId}/items/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  })
}

export async function deletePantryItem(pantryId: number, itemId: number) {
  return enqueueSerial(`pantry-write-${pantryId}`, async () => {
    return apiRequest(`${API_ENDPOINTS.PANTRY_ITEMS}/${pantryId}/items/${itemId}`, {
      method: 'DELETE'
    })
  })
}


export interface ShoppingList {
  id?: number
  name: string
  description?: string
  recurring: boolean
  metadata?: Record<string, any>
  items?: Array<{
    id: number
    product?: {
      id: number
      name: string
      metadata?: Record<string, any>
    }
    quantity: number
    unit: string
  }>
  owner?: {
    id: number
    name: string
    surname: string
    email: string
    metadata: Record<string, any>
    createdAt: string
    updatedAt: string
  }
  sharedWith?: Array<{
    id: number
    name: string
    surname: string
    email: string
  }>
  lastPurchasedAt?: string
  createdAt?: string
  updatedAt?: string
}

export async function getShoppingLists(params: Record<string, any> = {}) {
  const url = new URL(buildApiUrl(API_ENDPOINTS.SHOPPING_LISTS))
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null) {
      url.searchParams.append(k, String(v))
    }
  })
  const result = await apiRequest<ShoppingList[]>(url.pathname + url.search, { method: 'GET' })
  return normalizeArrayResponse<ShoppingList>(result)
}

export async function getShoppingListById(id: number) {
  return apiRequest<ShoppingList>(`${API_ENDPOINTS.SHOPPING_LISTS}/${id}`, {
    method: 'GET'
  })
}

export async function getShoppingListItems(listId: number, params: Record<string, any> = {}) {
  const url = new URL(buildApiUrl(`${API_ENDPOINTS.SHOPPING_LISTS}/${listId}/items`))
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null) {
      url.searchParams.append(k, String(v))
    }
  })
  const result = await apiRequest(url.pathname + url.search, { method: 'GET' })
  return normalizePaginatedResponse(result)
}

export async function createShoppingList(data: Omit<ShoppingList, 'id' | 'owner' | 'sharedWith' | 'lastPurchasedAt' | 'createdAt' | 'updatedAt'>) {
  return apiRequest<ShoppingList>(API_ENDPOINTS.SHOPPING_LISTS, {
    method: 'POST',
    body: JSON.stringify(data)
  })
}

export async function updateShoppingList(id: number, data: Partial<Omit<ShoppingList, 'id' | 'owner' | 'sharedWith' | 'lastPurchasedAt' | 'createdAt' | 'updatedAt'>>) {
  return apiRequest<ShoppingList>(`${API_ENDPOINTS.SHOPPING_LISTS}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  })
}

export async function deleteShoppingList(id: number) {
  return apiRequest(`${API_ENDPOINTS.SHOPPING_LISTS}/${id}`, {
    method: 'DELETE'
  })
}

export async function markListAsPurchased(id: number, metadata: Record<string, any> = {}) {
  return apiRequest(`${API_ENDPOINTS.SHOPPING_LISTS}/${id}/purchase`, {
    method: 'POST',
    body: JSON.stringify({ metadata })
  })
}

export async function resetShoppingList(id: number) {
  return apiRequest(`${API_ENDPOINTS.SHOPPING_LISTS}/${id}/reset`, {
    method: 'POST'
  })
}

export async function moveListItemsToPantry(id: number) {
  return apiRequest(`${API_ENDPOINTS.SHOPPING_LISTS}/${id}/move-to-pantry`, {
    method: 'POST'
  })
}

export async function shareShoppingList(id: number, email: string) {
  return apiRequest(`${API_ENDPOINTS.SHOPPING_LISTS}/${id}/share`, {
    method: 'POST',
    body: JSON.stringify({ email })
  })
}

export async function getSharedUsersForList(id: number) {
  return apiRequest<Array<{
    id: number
    name: string
    surname: string
    email: string
  }>>(`${API_ENDPOINTS.SHOPPING_LISTS}/${id}/shared-users`, {
    method: 'GET'
  })
}

export async function revokeListAccess(listId: number, userId: number) {
  return apiRequest(`${API_ENDPOINTS.SHOPPING_LISTS}/${listId}/share/${userId}`, {
    method: 'DELETE'
  })
}

export async function createListItem(listId: number, data: {
  product: { id: number }
  quantity: number
  unit: string
  metadata?: Record<string, any>
}) {
  return enqueueSerial(`list-write-${listId}`, async () => {
    const result = await apiRequest(`${API_ENDPOINTS.SHOPPING_LISTS}/${listId}/items`, {
      method: 'POST',
      body: JSON.stringify(data)
    })
    return result
  })
}

export async function updateListItem(listId: number, itemId: number, data: {
  quantity: number
  unit: string
}) {
  return enqueueSerial(`list-write-${listId}`, async () => {
    const result = await apiRequest(`${API_ENDPOINTS.SHOPPING_LISTS}/${listId}/items/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
    return result
  })
}

export async function deleteListItem(listId: number, itemId: number) {
  return enqueueSerial(`list-write-${listId}`, async () => {
    return apiRequest(`${API_ENDPOINTS.SHOPPING_LISTS}/${listId}/items/${itemId}`, {
      method: 'DELETE'
    })
  })
}
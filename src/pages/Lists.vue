<template>
  <BaseLayout>
    <div class="lists-wrapper">
      <div class="searchbar-container">
        <SearchBar v-model="query" placeholder="Buscar listas" />
      </div>
      <section class="section">
        <h2 class="section-title">Listas</h2>
        <button class="fab-add-list" @click="showAddList = true">
         <v-icon size="22" icon="mdi-plus" color="black" style="margin-right:8px" />
          Nueva lista
        </button>
        <div v-if="loading" class="empty-lists">
          Cargando listas...
        </div>
        <div v-else-if="displayedOwnLists.length === 0" class="empty-lists">
          No hay listas
        </div>
        <div v-else class="grid">
          <CollapsibleList
            v-for="list in displayedOwnLists"
            :key="list.id"
            :title="list.title"
            :items="filteredItems(list)"
            v-model:collapsed="list.collapsed"
            @add="() => openAddItem(list.id)"
            @remove="(item) => removeItem(list, item as any)"
            @edit="() => editList(list)"
            @update:title="(newTitle) => updateListTitle(list, newTitle)"
            item-key-field="id"
          >
             <template #header-actions="{ toggle, collapsed, startEdit }">
              <button class="icon-btn" aria-label="Agregar" @click="openAddItem(list.id)">
                <v-icon size="22" icon="mdi-plus" />
              </button>
              <button 
                class="icon-btn" 
                :aria-label="list.recurring ? 'Marcar como no recurrente' : 'Marcar como recurrente'"
                @click="toggleRecurring(list)"
                :class="{ 'recurring-active': list.recurring }"
              >
                <v-icon 
                  size="22" 
                  :icon="list.recurring ? 'mdi-star' : 'mdi-star-outline'"
                  :color="list.recurring ? 'amber' : 'black'"
                />
              </button>
              <button class="icon-btn" aria-label="Editar" @click="startEdit()">
                <v-icon size="22" icon="mdi-pencil-outline" />
              </button>
              <button class="icon-btn" aria-label="Compartir" @click="openShareList(list)">
                <v-icon size="22" icon="mdi-share-variant-outline" />
              </button>
              <button class="icon-btn" aria-label="Eliminar lista" @click="openDeleteListConfirm(list)">
                <v-icon size="22" icon="mdi-trash-can-outline" />
              </button>
              <button class="icon-btn" :aria-label="collapsed ? 'Expandir' : 'Contraer'" @click="toggle">
                <v-icon size="22" :icon="collapsed ? 'mdi-chevron-down' : 'mdi-chevron-up'" />
              </button>
            </template>
            <template #item-left="{ item }">
              <span class="emoji">{{ item.emoji || '📦' }}</span>
            </template>
            <template #item-right="{ item }">
              <ItemQtyActions
                :item="item as ItemQty"
                :onInc="() => incQty(list, item as any)"
                :onDec="() => decQty(list, item as any)"
              />
            </template>
            <template #empty>{{ hasQuery ? 'Sin coincidencias' : 'No hay productos' }}</template>
          </CollapsibleList>
        </div>
      </section>

      <!-- Listas Recurrentes -->
      <section class="section">
        <h2 class="section-title">Listas Recurrentes</h2>
        <div v-if="loading" class="empty-lists">
          Cargando listas recurrentes...
        </div>
        <div v-else-if="displayedRecurringLists.length === 0" class="empty-lists">
          No hay listas recurrentes
        </div>
        <div v-else class="grid">
          <CollapsibleList
            v-for="list in displayedRecurringLists"
            :key="list.id"
            :title="list.title"
            :items="filteredItems(list)"
            v-model:collapsed="list.collapsed"
            @add="() => openAddItem(list.id)"
            @remove="(item) => removeItem(list, item as any)"
            @edit="() => editList(list)"
            @update:title="(newTitle) => updateListTitle(list, newTitle)"
            item-key-field="id"
          >
             <template #header-actions="{ toggle, collapsed, startEdit }">
              <button class="icon-btn" aria-label="Agregar" @click="openAddItem(list.id)">
                <v-icon size="22" icon="mdi-plus" />
              </button>
              <button 
                class="icon-btn" 
                :aria-label="list.recurring ? 'Marcar como no recurrente' : 'Marcar como recurrente'"
                @click="toggleRecurring(list)"
                :class="{ 'recurring-active': list.recurring }"
              >
                <v-icon 
                  size="22" 
                  :icon="list.recurring ? 'mdi-star' : 'mdi-star-outline'"
                  :color="list.recurring ? 'amber' : 'black'"
                />
              </button>
              <button class="icon-btn" aria-label="Editar" @click="startEdit()">
                <v-icon size="22" icon="mdi-pencil-outline" />
              </button>
              <button class="icon-btn" aria-label="Compartir" @click="openShareList(list)">
                <v-icon size="22" icon="mdi-share-variant-outline" />
              </button>
              <button class="icon-btn" aria-label="Eliminar lista" @click="openDeleteListConfirm(list)">
                <v-icon size="22" icon="mdi-trash-can-outline" />
              </button>
              <button class="icon-btn" :aria-label="collapsed ? 'Expandir' : 'Contraer'" @click="toggle">
                <v-icon size="22" :icon="collapsed ? 'mdi-chevron-down' : 'mdi-chevron-up'" />
              </button>
            </template>
            <template #item-left="{ item }">
              <span class="emoji">{{ item.emoji || '📦' }}</span>
            </template>
            <template #item-right="{ item }">
              <ItemQtyActions
                :item="item as ItemQty"
                :onInc="() => incQty(list, item as any)"
                :onDec="() => decQty(list, item as any)"
              />
            </template>
            <template #empty>{{ hasQuery ? 'Sin coincidencias' : 'No hay productos' }}</template>
          </CollapsibleList>
        </div>
      </section>

      <!-- Listas Compartidas Conmigo -->
      <section class="section">
        <h2 class="section-title">Listas Compartidas Conmigo</h2>
        <div v-if="loading" class="empty-lists">
          Cargando listas compartidas...
        </div>
        <div v-else-if="displayedSharedLists.length === 0" class="empty-lists">
          No hay listas compartidas
        </div>
        <div v-else class="grid">
          <CollapsibleList
            v-for="list in displayedSharedLists"
            :key="list.id"
            :title="list.title"
            :items="filteredItems(list)"
            v-model:collapsed="list.collapsed"
            @remove="(item) => removeItem(list, item as any)"
            @update:title="(newTitle) => updateListTitle(list, newTitle)"
            item-key-field="id"
          >
            <template #header-actions="{ toggle, collapsed }">
              <button class="icon-btn" :aria-label="collapsed ? 'Expandir' : 'Contraer'" @click="toggle">
                <v-icon size="22" :icon="collapsed ? 'mdi-chevron-down' : 'mdi-chevron-up'" />
              </button>
            </template>
            <template #item-left="{ item }">
              <span class="emoji">{{ item.emoji || '📦' }}</span>
            </template>
            <template #item-right="{ item }">
              <ItemQtyActions
                :item="item as ItemQty"
                :readonly="true"
              />
            </template>
            <template #empty>{{ hasQuery ? 'Sin coincidencias' : 'No hay productos' }}</template>
          </CollapsibleList>
        </div>
      </section>

      <NewListForm 
        v-if="showAddList"
        @submit="confirmAddListForm"
        @cancel="cancelAddList"
      />
      <div v-if="showAddItem">
        <SelectProductForm
          title="Agregar Productos a la Lista"
          @add="confirmAddItemForm"
          @addMultiple="confirmAddItems"
          @cancel="cancelAddItem"
        />
      </div>
      <ConfirmDeleteModal
        v-if="showDeleteListConfirm"
        title="Eliminar Lista"
        :submessage="'Esta acción no se puede deshacer y se eliminarán todos los productos asociados.'"
        @confirm="confirmDeleteList"
        @cancel="cancelDeleteList"
      >
        <template #message>
          ¿Estás seguro de que deseas eliminar la lista "<strong>{{ deletingList?.title }}</strong>"?
        </template>
      </ConfirmDeleteModal>
      <div v-if="showShareList">
        <div class="modal-bg" @click.self="cancelShareList">
          <div class="modal">
            <h3>Compartir Lista</h3>
            
            <div v-if="shareError" class="error-message">{{ shareError }}</div>
            <div v-if="shareSuccess" class="success-message">{{ shareSuccess }}</div>

            <label>
              Email del usuario
              <input
                type="email"
                v-model="shareEmail"
                placeholder="usuario@ejemplo.com"
                @keyup.enter="confirmShareList"
              >
            </label>

            <div class="modal-actions">
              <button @click="confirmShareList" :disabled="sharingInProgress">
                Compartir
              </button>
              <button @click="cancelShareList">Cancelar</button>
            </div>

            <div v-if="sharingInProgress" class="sharing-progress">
              <div class="spinner"></div>
              <span>Compartiendo lista...</span>
            </div>

            <div class="shared-users-section">
              <h4>Compartido con:</h4>
              <div v-if="loadingSharedUsers" class="loading-users">
                Cargando usuarios...
              </div>
              <ul v-else-if="sharedUsersList.length > 0" class="shared-users-list">
                <li v-for="user in sharedUsersList" :key="user.id" class="shared-user-item">
                  <div class="user-info">
                    <span class="user-icon">👤</span>
                    <div class="user-details">
                      <span class="user-name">{{ user.name }} {{ user.surname }}</span>
                      <span class="user-email">{{ user.email }}</span>
                    </div>
                  </div>
                  <button class="revoke-btn" @click="revokeUserAccess(user)" title="Revocar acceso">
                    ❌
                  </button>
                </li>
              </ul>
              <div v-else class="empty-users">
                Esta lista no está compartida con nadie
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </BaseLayout>
</template>

<script setup lang="ts">
import BaseLayout from '@/layouts/BaseLayout.vue'
import CollapsibleList from '@/components/lists/CollapsibleList.vue'
import ItemQtyActions from '@/components/ItemQtyActions.vue'
import NewListForm from '@/components/NewListForm.vue'
import SelectProductForm from '@/components/SelectProductForm.vue'
import SearchBar from '@/components/SearchBar.vue'
import { ref, onMounted, computed, nextTick } from 'vue'
import { 
  getShoppingLists, 
  createShoppingList, 
  updateShoppingList, 
  deleteShoppingList, 
  getShoppingListItems,
  createListItem,
  updateListItem,
  deleteListItem,
  markListAsPurchased,
  resetShoppingList,
  moveListItemsToPantry,
  shareShoppingList,
  getSharedUsersForList,
  revokeListAccess,
  getProducts,
  type ShoppingList as ApiShoppingList
} from '@/utils/api'
import ConfirmDeleteModal from '@/components/ConfirmDeleteModal.vue'

type Item = { id: number; label: string; emoji?: string }
type ItemQty = Item & { qty: number; productId?: number; unit: string }
type List = {
  id: number
  title: string
  description: string
  recurring: boolean
  items: ItemQty[]
  collapsed: boolean
}

type SharedUser = {
  id: number
  name: string
  surname: string
  email: string
}

const ownLists = ref<List[]>([])
const sharedLists = ref<List[]>([])
const showAddList = ref(false)
const showAddItem = ref(false)
const showShareList = ref(false)
const showDeleteListConfirm = ref(false)
const sharingList = ref<List | null>(null)
const deletingList = ref<List | null>(null)

const loading = ref(false)
const error = ref<string | null>(null)
const shareEmail = ref('')
const shareError = ref<string | null>(null)
const shareSuccess = ref<string | null>(null)
const sharedUsersList = ref<SharedUser[]>([])
const loadingSharedUsers = ref(false)
const sharingInProgress = ref(false)

const productsLookup = ref(new Map())

const addItemTargetId = ref<number | null>(null)

const query = ref('')
const hasQuery = computed(() => query.value.trim().length > 0)

function normalizedQuery() {
  return query.value.trim().toLowerCase()
}

function listMatches(list: List) {
  const q = normalizedQuery()
  if (!q) return true
  const titleMatch = list.title.toLowerCase().includes(q)
  const itemMatch = list.items.some(i => (i.label || '').toLowerCase().includes(q))
  return titleMatch || itemMatch
}

function filteredItems(list: List) {
  const q = normalizedQuery()
  if (!q) return list.items
  return list.items.filter(i => (i.label || '').toLowerCase().includes(q))
}

const displayedOwnLists = computed(() => {
  const q = normalizedQuery()
  const filteredLists = q ? ownLists.value.filter(listMatches) : ownLists.value
  return filteredLists.filter(list => !list.recurring)
})

const displayedRecurringLists = computed(() => {
  const q = normalizedQuery()
  const filteredLists = q ? ownLists.value.filter(listMatches) : ownLists.value
  return filteredLists.filter(list => list.recurring)
})

const displayedSharedLists = computed(() => {
  const q = normalizedQuery()
  if (!q) return sharedLists.value
  return sharedLists.value.filter(listMatches)
})

async function fetchLists() {
  loading.value = true
  error.value = null
  try {
    const allProducts = await getProducts({ page: 1, per_page: 1000 })
    productsLookup.value.clear()
    allProducts.forEach((product: any) => {
      productsLookup.value.set(product.id, product)
    })

    const ownListsData = await getShoppingLists({ owner: true })
    
    const sharedListsData = await getShoppingLists({ owner: false })

    const ownListsWithItems = await Promise.all(
      ownListsData.map(async (list: any) => {
        try {
          const itemsResponse = await getShoppingListItems(list.id, {
            page: 1,
            per_page: 100,
            order: 'ASC',
            sort_by: 'createdAt'
          })

          const items = (itemsResponse.data || []).map((item: any) => {
            const productData = productsLookup.value.get(item.productId) || item.product
            
            return {
              id: item.id,
              label: productData?.name || item.productName || `Producto ${item.id}`,
              emoji: productData?.metadata?.emoji || item.emoji || '📦',
              qty: item.quantity || 1,
              productId: productData?.id || item.productId,
              unit: item.unit || 'unidades',
              categoryId: productData?.category?.id || item.categoryId,
              categoryName: productData?.category?.name || item.categoryName
            }
          })

          return {
            id: list.id,
            title: list.name,
            description: list.description || '',
            recurring: list.recurring,
            items,
            collapsed: false
          }
        } catch (e: any) {
          console.error(`Error al cargar items de lista ${list.id}:`, e)
          return {
            id: list.id,
            title: list.name,
            description: list.description || '',
            recurring: list.recurring,
            items: [],
            collapsed: false
          }
        }
      })
    )

    const sharedListsWithItems = await Promise.all(
      sharedListsData.map(async (list: any) => {
        try {
          const itemsResponse = await getShoppingListItems(list.id, {
            page: 1,
            per_page: 100,
            order: 'ASC',
            sort_by: 'createdAt'
          })

          const items = (itemsResponse.data || []).map((item: any) => {
            const productData = productsLookup.value.get(item.productId) || item.product
            
            return {
              id: item.id,
              label: productData?.name || item.productName || `Producto ${item.id}`,
              emoji: productData?.metadata?.emoji || item.emoji || '📦',
              qty: item.quantity || 1,
              productId: productData?.id || item.productId,
              unit: item.unit || 'unidades',
              categoryId: productData?.category?.id || item.categoryId,
              categoryName: productData?.category?.name || item.categoryName
            }
          })

          return {
            id: list.id,
            title: list.name,
            description: list.description || '',
            recurring: list.recurring,
            items,
            collapsed: false
          }
        } catch (e: any) {
          console.error(`Error al cargar items de lista ${list.id}:`, e)
          return {
            id: list.id,
            title: list.name,
            description: list.description || '',
            recurring: list.recurring,
            items: [],
            collapsed: false
          }
        }
      })
    )

    ownLists.value = ownListsWithItems
    sharedLists.value = sharedListsWithItems
  } catch (e: any) {
    if (e.status === 401) {
      error.value = 'No estás autorizado. Por favor, inicia sesión.'
    } else if (e.status === 500) {
      error.value = 'Error del servidor al cargar listas.'
    } else {
      error.value = e.message || 'Error al cargar listas'
    }
    console.error('Error al cargar listas:', e)
  } finally {
    loading.value = false
  }
}

onMounted(fetchLists)

async function confirmAddListForm(formData: { name: string; description: string; recurring: boolean; metadata: Record<string, any> }) {
  if (!formData.name) return
  try {
    const created = await createShoppingList(formData)
    ownLists.value.push({
      id: created.id!,
      title: created.name,
      description: created.description || '',
      recurring: created.recurring,
      items: [],
      collapsed: false
    })
  } catch (e: any) {
    error.value = e.message || 'Error al crear lista'
  }
  showAddList.value = false
}

function cancelAddList() {
  showAddList.value = false
}

function openAddItem(listId: number) {
  addItemTargetId.value = listId
  showAddItem.value = true
}

async function confirmAddItemForm({ productId, quantity }: { productId: number; quantity: number }) {
  if (addItemTargetId.value === null || !productId) return

  let list = ownLists.value.find(l => l.id === addItemTargetId.value)
  if (!list) {
    list = sharedLists.value.find(l => l.id === addItemTargetId.value)
  }
  if (!list) return

  try {
    const existingItem = list.items.find(i => i.productId === productId)
    if (existingItem) {
      const newQty = existingItem.qty + quantity
      const updated = await updateListItem(list.id, existingItem.id, {
        quantity: newQty,
        unit: existingItem.unit || 'unidades'
      })
      existingItem.qty = updated.quantity !== undefined ? updated.quantity : newQty
    } else {
      const created = await createListItem(list.id, {
        product: { id: productId },
        quantity: quantity,
        unit: 'unidades',
        metadata: {}
      })

      const itemData = created.item || created
      
      const productData = productsLookup.value.get(productId)
      
      list.items.push({
        id: itemData.id,
        label: productData?.name || itemData.product?.name || itemData.productName || `Producto ${itemData.id}`,
        emoji: productData?.metadata?.emoji || itemData.product?.metadata?.emoji || '📦',
        qty: itemData.quantity || quantity,
        productId: productData?.id || itemData.product?.id || itemData.productId || productId,
        unit: itemData.unit || 'unidades'
      })
    }

    error.value = null
  } catch (e: any) {
    if (e.status === 400) {
      error.value = 'Datos inválidos. Verifica la información del producto.'
      console.error('Error 400 details:', e)
    } else if (e.status === 401) {
      error.value = 'No tienes autorización para agregar productos a esta lista.'
    } else if (e.status === 404) {
      error.value = 'Producto o lista no encontrada.'
    } else if (e.status === 409) {
      error.value = 'El producto ya existe en la lista o hay un conflicto.'
    } else if (e.status === 500) {
      error.value = 'Error del servidor. Intenta nuevamente.'
    } else {
      error.value = e.message || 'Error al agregar producto a la lista'
    }
    console.error('Error al agregar producto:', e)
    return
  }

  showAddItem.value = false
  addItemTargetId.value = null
}

async function addSingleToList(listId: number, productId: number, quantity: number) {
  let list = ownLists.value.find(l => l.id === listId)
  if (!list) {
    list = sharedLists.value.find(l => l.id === listId)
  }
  if (!list) throw new Error('Lista no encontrada')

  const existing = list.items.find(i => i.productId === productId)
  if (existing) {
    const newQty = existing.qty + quantity
    const updated = await updateListItem(list.id, existing.id, { quantity: newQty, unit: existing.unit || 'unidades' })
    existing.qty = updated.quantity !== undefined ? updated.quantity : newQty
    return existing
  } else {
    const created = await createListItem(list.id, { product: { id: productId }, quantity, unit: 'unidades', metadata: {} })
    
    const itemData = created.item || created
  
    const productData = productsLookup.value.get(productId)
    
    const newItem = {
      id: itemData.id,
      label: productData?.name || itemData.product?.name || itemData.productName || `Producto ${itemData.id}`,
      emoji: productData?.metadata?.emoji || itemData.product?.metadata?.emoji || '📦',
      qty: itemData.quantity || quantity,
      productId: productData?.id || itemData.product?.id || itemData.productId || productId,
      unit: itemData.unit || 'unidades'
    }
    list.items.push(newItem)
    return newItem
  }
}

async function confirmAddItems(payload: { items: { productId: number; quantity: number }[] }) {
  if (addItemTargetId.value === null) return
  const listId = addItemTargetId.value
  try {
    for (const it of payload.items) {
      await addSingleToList(listId, it.productId, it.quantity)
    }
    error.value = null
  } catch (e: any) {
    error.value = e?.message || 'Error al agregar productos a la lista'
  } finally {
    showAddItem.value = false
    addItemTargetId.value = null
  }
}

function cancelAddItem() {
  showAddItem.value = false
  addItemTargetId.value = null
}

async function removeItem(list: List, item: ItemQty) {
  try {
    await deleteListItem(list.id, item.id)
    list.items = list.items.filter(i => i.id !== item.id)
  } catch (e: any) {
    error.value = e.message || 'Error al eliminar producto'
  }
}


async function updateListTitle(list: List, newTitle: string) {
  try {
    const updated = await updateShoppingList(list.id, { 
      name: newTitle,
      description: list.description,
      recurring: list.recurring
    })
    list.title = updated.name
  } catch (e: any) {
    error.value = e.message || 'Error al actualizar lista'
  }
}

async function incQty(list: List, item: Item) {
  const itemQty = item as ItemQty
  const newQty = itemQty.qty + 1
  try {
    const updated = await updateListItem(list.id, itemQty.id, {
      quantity: newQty,
      unit: itemQty.unit || 'unidades'
    })
    itemQty.qty = updated.quantity !== undefined ? updated.quantity : newQty
    await nextTick() 
  } catch (e: any) {
    error.value = e.message || 'Error al actualizar cantidad'
  }
}

async function decQty(list: List, item: Item) {
  const itemQty = item as ItemQty
  const newQty = Math.max(0, itemQty.qty - 1)

  if (newQty === 0) {
    await removeItem(list, itemQty)
  } else {
    try {
      const updated = await updateListItem(list.id, itemQty.id, {
        quantity: newQty,
        unit: itemQty.unit || 'unidades'
      })
      itemQty.qty = updated.quantity !== undefined ? updated.quantity : newQty
      await nextTick() 
    } catch (e: any) {
      error.value = e.message || 'Error al actualizar cantidad'
    }
  }
}

function openDeleteListConfirm(list: List) {
  deletingList.value = list
  showDeleteListConfirm.value = true
}

async function confirmDeleteList() {
  if (!deletingList.value) return

  try {
    await deleteShoppingList(deletingList.value.id)
    ownLists.value = ownLists.value.filter(p => p.id !== deletingList.value!.id)
    showDeleteListConfirm.value = false
    deletingList.value = null
  } catch (e: any) {
    error.value = e.message || 'Error al eliminar lista'
    console.error('Error al eliminar lista:', e)
  }
}

function cancelDeleteList() {
  showDeleteListConfirm.value = false
  deletingList.value = null
}

async function toggleRecurring(list: List) {
  const newRecurringValue = !list.recurring
  
  try {
    await updateShoppingList(list.id, { recurring: newRecurringValue })
    list.recurring = newRecurringValue
  } catch (e: any) {
    error.value = e.message || 'Error al actualizar lista'
    console.error('Error al actualizar estado recurrente:', e)
  }
}

async function openShareList(list: List) {
  sharingList.value = list
  shareEmail.value = ''
  shareError.value = null
  shareSuccess.value = null
  showShareList.value = true

  await loadSharedUsers(list.id)
}

async function loadSharedUsers(listId: number) {
  loadingSharedUsers.value = true
  try {
    const users = await getSharedUsersForList(listId)
    sharedUsersList.value = Array.isArray(users) ? users : []
  } catch (e: any) {
    console.error('Error al cargar usuarios compartidos:', e)
    sharedUsersList.value = []
  } finally {
    loadingSharedUsers.value = false
  }
}

async function confirmShareList() {
  if (!shareEmail.value) {
    shareError.value = 'Ingresa un email para compartir la lista'
    return
  }

  if (!sharingList.value) return

  sharingInProgress.value = true
  shareError.value = null
  shareSuccess.value = null

  try {
    await shareShoppingList(sharingList.value.id, shareEmail.value)

    shareSuccess.value = 'Lista compartida con éxito'
    shareError.value = null
    shareEmail.value = ''

    await loadSharedUsers(sharingList.value.id)
  } catch (e: any) {
    if (e.status === 404) {
      shareError.value = 'Usuario no encontrado'
    } else if (e.status === 409) {
      shareError.value = 'Esta lista ya está compartida con ese usuario'
    } else {
      shareError.value = e.message || 'Error al compartir lista'
    }
  } finally {
    sharingInProgress.value = false
  }
}

function cancelShareList() {
  showShareList.value = false
  sharingList.value = null
  shareEmail.value = ''
  shareError.value = null
  shareSuccess.value = null
  sharedUsersList.value = []
}

async function revokeUserAccess(user: SharedUser) {
  try {
    if (!sharingList.value) return

    await revokeListAccess(sharingList.value.id, user.id)
    await loadSharedUsers(sharingList.value.id)
  } catch (e: any) {
    console.error('Error al revocar acceso:', e)
    shareError.value = e.message || 'Error al revocar acceso'
  }
}

async function purchaseList(list: List) {
  try {
    await markListAsPurchased(list.id, {})
  } catch (e: any) {
    error.value = e.message || 'Error al marcar lista como comprada'
  }
}

async function resetList(list: List) {
  try {
    await resetShoppingList(list.id)
  } catch (e: any) {
    error.value = e.message || 'Error al reiniciar lista'
  }
}

async function moveItemsToPantry(list: List) {
  try {
    await moveListItemsToPantry(list.id)
  } catch (e: any) {
    error.value = e.message || 'Error al mover items a la despensa'
  }
}
</script>

<style scoped>
.lists-wrapper {
  max-width: 980px;
  margin: 0 auto;
  padding: 24px 16px;
}
.searchbar-container {
  margin: 8px 6px 16px;
}
.section {
  margin-bottom: 36px;
}
.section-title {
  margin: 8px 6px 12px;
  font-weight: 700;
  font-size: 24px;
  color: #000;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 16px;
}
.emoji {
  font-size: 24px;
  width: 30px;
  display: inline-block;
  text-align: center;
}
.empty-lists {
  text-align: center;
  color: #647060;
  font-size: 20px;
  font-style: italic;
  margin: 32px 0 24px 0;
}
.fab-add-list {
  position: fixed;
  right: 32px;
  bottom: 32px;
  z-index: 100;
  display: flex;
  align-items: center;
  background: #fff;
  color: #000;
  border: none;
  border-radius: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.18);
  padding: 12px 22px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: box-shadow 0.2s;
}
.fab-add-list:hover {
  box-shadow: 0 4px 16px rgba(0,0,0,0.28);
}
.icon-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: #9bd166;
  color: #1f1f1f;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: filter 0.2s;
}
.icon-btn:hover {
  filter: brightness(0.95);
}
.icon-btn:active {
  filter: brightness(0.9);
}
.modal-bg {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
}
.modal {
  background: #fff;
  border-radius: 12px;
  padding: 24px 28px 18px;
  min-width: 260px;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.18);
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.modal h3 {
  margin: 0 0 8px;
  font-size: 20px;
  color: #1f1f1f;
  justify-content: center;
  text-align: center;
}
.modal label {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 15px;
}
.modal input {
  font-size: 16px;
  padding: 4px 8px;
  border-radius: 6px;
  border: 1px solid #bbb;
  color: #222;
  background: #fff;
}
.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 8px;
}
.modal-actions button {
  padding: 6px 16px;
  border-radius: 8px;
  border: none;
  background: #eee;
  color: #222;
  font-weight: 600;
  cursor: pointer;
}
.modal-actions button:first-child {
  background: #000;
  color: #fff;
}
.error-message {
  color: #e74c3c;
  font-size: 14px;
  padding: 8px 12px;
  background: #ffebee;
  border-radius: 4px;
  border-left: 3px solid #e74c3c;
}
.success-message {
  color: #2ecc71;
  font-size: 14px;
  padding: 8px 12px;
  background: #e8f5e9;
  border-radius: 4px;
  border-left: 3px solid #2ecc71;
}
.shared-users-section {
  margin-top: 16px;
}
.shared-users-section h4 {
  margin: 0 0 8px;
  font-size: 18px;
  color: #333;
}
.shared-users-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.shared-user-item {
  display: flex;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}
.shared-user-item:last-child {
  border-bottom: none;
}
.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}
.user-icon {
  font-size: 20px;
}
.user-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.user-name {
  font-weight: 500;
  color: #111;
}
.user-email {
  font-size: 14px;
  color: #555;
}
.loading-users {
  text-align: center;
  color: #999;
  font-size: 16px;
  padding: 12px 0;
}
.empty-users {
  text-align: center;
  color: #999;
  font-size: 16px;
  padding: 12px 0;
}
.revoke-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  margin-left: auto;
  color: #e74c3c;
  transition: color 0.2s;
}
.revoke-btn:hover {
  color: #c0392b;
}
.modal-delete {
  text-align: center;
  max-width: 450px;
}
.modal-icon-warning {
  font-size: 48px;
  margin-bottom: 12px;
}
.modal-message {
  font-size: 16px;
  color: #333;
  margin: 12px 0;
  line-height: 1.5;
}
.modal-message strong {
  color: #000;
  font-weight: 600;
}
.modal-submessage {
  font-size: 14px;
  color: #666;
  margin: 8px 0 16px;
  line-height: 1.4;
}
.btn-delete {
  background: #e74c3c ;
  color: #fff ;
}
.btn-delete:hover {
  background: #c0392b ;
}
.btn-cancel {
  background: #eee ;
  color: #222 ;
}
.btn-cancel:hover {
  background: #ddd ;
}
.sharing-progress {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #333;
  margin-top: 8px;
}
.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #9bd166;
  border-top: 2px solid #fff;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

.recurring-active {
  background-color: rgba(255, 193, 7, 0.1);
  border-radius: 4px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>

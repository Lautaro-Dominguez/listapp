<template>
  <BaseLayout>
    <div class="despensa-wrapper">
      <div class="searchbar-container">
        <SearchBar v-model="query" placeholder="Buscar despensas" />
      </div>
      <section class="section">
        <h2 class="section-title">Despensas</h2>
        <button class="fab-add-pantry" @click="showAddPantry = true">
          <v-icon size="22" icon="mdi-plus" color="black" style="margin-right:8px" />
          Nueva despensa
        </button>
        <div v-if="loading" class="empty-pantries">
          Cargando...
        </div>
        <div v-else-if="displayedOwnPantries.length === 0" class="empty-pantries">
          {{ hasQuery ? 'No se encontraron resultados' : 'No hay despensas' }}
        </div>
        <div v-else class="grid">
          <CollapsibleList
            v-for="pantry in displayedOwnPantries"
            :key="pantry.id"
            :title="pantry.title"
            :items="filteredItems(pantry)"
            v-model:collapsed="pantry.collapsed"
            @add="() => openAddItem(pantry.id)"
            @remove="(item) => removeItem(pantry, item as any)"
            @update:title="(newTitle) => updatePantryTitle(pantry, newTitle)"
            item-key-field="id"
          >
            <template #header-actions="{ toggle, collapsed, startEdit }">
              <button class="icon-btn" aria-label="Agregar" @click="openAddItem(pantry.id)">
                <v-icon size="22" icon="mdi-plus" />
              </button>
              <button class="icon-btn" aria-label="Editar" @click="startEdit()">
                <v-icon size="22" icon="mdi-pencil-outline" />
              </button>
              <button class="icon-btn" aria-label="Compartir" @click="openSharePantry(pantry)">
                <v-icon size="22" icon="mdi-share-variant-outline" />
              </button>
              <button class="icon-btn" aria-label="Eliminar despensa" @click="openDeletePantryConfirm(pantry)">
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
                :onInc="() => incQty(pantry, item as any)"
                :onDec="() => decQty(pantry, item as any)"
              />
            </template>
            <template #empty>{{ hasQuery ? 'Sin coincidencias' : 'No hay productos' }}</template>
          </CollapsibleList>
        </div>
      </section>

      <!-- Despensas Compartidas Conmigo -->
      <section class="section">
        <h2 class="section-title">Despensas Compartidas Conmigo</h2>
        <div v-if="loading" class="empty-pantries">
          Cargando...
        </div>
        <div v-else-if="displayedSharedPantries.length === 0" class="empty-pantries">
          {{ hasQuery ? 'No se encontraron resultados' : 'No hay despensas compartidas' }}
        </div>
        <div v-else class="grid">
          <CollapsibleList
            v-for="pantry in displayedSharedPantries"
            :key="pantry.id"
            :title="pantry.title"
            :items="filteredItems(pantry)"
            v-model:collapsed="pantry.collapsed"
            @remove="(item) => removeItem(pantry, item as any)"
            @update:title="(newTitle) => updatePantryTitle(pantry, newTitle)"
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

      <div v-if="showAddPantry">
        <NewCategoryForm
          title="Nueva despensa"
          placeholder="Nombre de la despensa"
          @add="confirmAddPantryForm"
          @cancel="cancelAddPantry"
        />
      </div>
      <div v-if="showAddItem">
          <SelectProductForm
          title="Agregar Productos a la Despensa"
          @add="confirmAddItemForm"
          @addMultiple="confirmAddItems"
          @cancel="cancelAddItem"
        />
      </div>
      <ConfirmDeleteModal
        v-if="showDeletePantryConfirm"
        title="Eliminar Despensa"
        :submessage="'Esta acción no se puede deshacer y se eliminarán todos los productos asociados.'"
        @confirm="confirmDeletePantry"
        @cancel="cancelDeletePantry"
      >
        <template #message>
          ¿Estás seguro de que deseas eliminar la despensa "<strong>{{ deletingPantry?.title }}</strong>"?
        </template>
      </ConfirmDeleteModal>
      <div v-if="showSharePantry">
        <div class="modal-bg" @click="cancelSharePantry">
          <div class="modal modal-share" @click.stop>
            <h3>Compartir Despensa</h3>

            <div class="share-form">
              <label>Email del usuario:
                <input
                  v-model="shareEmail"
                  type="email"
                  placeholder="usuario@ejemplo.com"
                  @keyup.enter="confirmSharePantry"
                  :disabled="sharingInProgress"
                  autofocus
                />
              </label>

              <div v-if="sharingInProgress" class="sharing-progress">
                <div class="spinner"></div>
                <span>Compartiendo despensa...</span>
              </div>

              <div v-if="shareError" class="error-message">{{ shareError }}</div>
              <div v-if="shareSuccess" class="success-message">{{ shareSuccess }}</div>
              <div class="modal-actions">
                <button @click="confirmSharePantry" :disabled="sharingInProgress">
                  {{ sharingInProgress ? 'Compartiendo...' : 'Compartir' }}
                </button>
              </div>
            </div>

            <div class="shared-users-section">
              <h4>Compartido con:</h4>
              <div v-if="loadingSharedUsers" class="loading-users">
                Cargando usuarios...
              </div>
              <div v-else-if="sharedUsersList.length === 0" class="empty-users">
                Esta despensa no está compartida con nadie
              </div>
              <ul v-else class="shared-users-list">
                <li v-for="user in sharedUsersList" :key="user.id" class="shared-user-item">
                  <div class="user-info">
                    <span class="user-icon">👤</span>
                    <div class="user-details">
                      <div class="user-name">{{ user.name }} {{ user.surname }}</div>
                      <div class="user-email">{{ user.email }}</div>
                    </div>
                  </div>
                  <button
                    class="revoke-btn"
                    @click="revokeUserAccess(user)"
                    aria-label="Revocar acceso"
                    title="Dejar de compartir"
                  >
                    <v-icon size="18" icon="mdi-close" />
                  </button>
                </li>
              </ul>
            </div>

            <div class="modal-actions">
              <button @click="cancelSharePantry">Cerrar</button>
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
import NewCategoryForm from '@/components/NewCategoryForm.vue'
import SelectProductForm from '@/components/SelectProductForm.vue'
import SearchBar from '@/components/SearchBar.vue'
import { ref, onMounted, computed } from 'vue'
import { getPantries, createPantry, updatePantry, deletePantry, getPantryItems, createPantryItem, updatePantryItem, deletePantryItem, sharePantry, getSharedUsers, revokeSharePantry } from '@/utils/api'
import ConfirmDeleteModal from '@/components/ConfirmDeleteModal.vue'

type Item = { id: number; label: string; emoji?: string }
type ItemQty = Item & { qty: number; productId?: number; unit: string }
type Pantry = {
  id: number
  title: string
  emoji: string
  items: ItemQty[]
  collapsed: boolean
}

type SharedUser = {
  id: number
  name: string
  surname: string
  email: string
  metadata: any
  createdAt: string
  updatedAt: string
}

const ownPantries = ref<Pantry[]>([])
const sharedPantries = ref<Pantry[]>([])
const showAddPantry = ref(false)
const showAddItem = ref(false)
const showSharePantry = ref(false)
const showDeletePantryConfirm = ref(false)
const sharingPantry = ref<Pantry | null>(null)
const deletingPantry = ref<Pantry | null>(null)
const addItemTargetId = ref<number | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const shareEmail = ref('')
const shareError = ref<string | null>(null)
const shareSuccess = ref<string | null>(null)
const sharedUsersList = ref<SharedUser[]>([])
const loadingSharedUsers = ref(false)
const sharingInProgress = ref(false)

const query = ref('')
const hasQuery = computed(() => query.value.trim().length > 0)

function normalizedQuery() {
  return query.value.trim().toLowerCase()
}

function pantryMatches(pantry: Pantry) {
  const q = normalizedQuery()
  if (!q) return true
  const titleMatch = pantry.title.toLowerCase().includes(q)
  const itemMatch = pantry.items.some(i => (i.label || '').toLowerCase().includes(q))
  return titleMatch || itemMatch
}

function filteredItems(pantry: Pantry) {
  const q = normalizedQuery()
  if (!q) return pantry.items
  return pantry.items.filter(i => (i.label || '').toLowerCase().includes(q))
}

const displayedOwnPantries = computed(() => {
  const q = normalizedQuery()
  if (!q) return ownPantries.value
  return ownPantries.value.filter(pantryMatches)
})

const displayedSharedPantries = computed(() => {
  const q = normalizedQuery()
  if (!q) return sharedPantries.value
  return sharedPantries.value.filter(pantryMatches)
})

async function fetchPantriesAndItems() {
  loading.value = true
  error.value = null
  try {
    const ownResponse = await getPantries({ page: 1, per_page: 100, order: 'ASC', sort_by: 'createdAt', owner: true })
    const ownPantriesData = ownResponse.data || []

    const sharedResponse = await getPantries({ page: 1, per_page: 100, order: 'ASC', sort_by: 'createdAt', owner: false })
    const sharedPantriesData = sharedResponse.data || []

    const ownPantriesWithItems = await Promise.all(
      ownPantriesData.map(async (p: any) => {
        try {
          const itemsResponse = await getPantryItems(p.id, {
            page: 1,
            per_page: 100,
            order: 'ASC',
            sort_by: 'createdAt'
          })

          const items = (itemsResponse.data || []).map((item: any) => ({
            id: item.id,
            label: item.product?.name || 'Producto',
            emoji: item.product?.metadata?.emoji || '📦',
            qty: item.quantity || 1,
            productId: item.product?.id,
            unit: item.unit,
            categoryId: item.product?.category?.id,
            categoryName: item.product?.category?.name
          }))

          return {
            id: p.id,
            title: p.name,
            emoji: '🏠',
            items,
            collapsed: false
          }
        } catch (e: any) {
          if (e.status === 400) {
            console.error(`Error 400: Datos inválidos al cargar items de pantry ${p.id}`)
          } else if (e.status === 401) {
            console.error(`Error 401: No autorizado para cargar items de pantry ${p.id}`)
          } else if (e.status === 404) {
            console.error(`Error 404: Pantry ${p.id} no encontrada`)
          } else if (e.status === 500) {
            console.error(`Error 500: Error del servidor al cargar items de pantry ${p.id}`)
          } else {
            console.error(`Error al cargar items de pantry ${p.id}:`, e)
          }

          return {
            id: p.id,
            title: p.name,
            emoji: '🏠',
            items: [],
            collapsed: false
          }
        }
      })
    )

    const sharedPantriesWithItems = await Promise.all(
      sharedPantriesData.map(async (p: any) => {
        try {
          const itemsResponse = await getPantryItems(p.id, {
            page: 1,
            per_page: 100,
            order: 'ASC',
            sort_by: 'createdAt'
          })

          const items = (itemsResponse.data || []).map((item: any) => ({
            id: item.id,
            label: item.product?.name || 'Producto',
            emoji: item.product?.metadata?.emoji || '📦',
            qty: item.quantity || 1,
            productId: item.product?.id,
            unit: item.unit,
            categoryId: item.product?.category?.id,
            categoryName: item.product?.category?.name
          }))

          return {
            id: p.id,
            title: p.name,
            emoji: '🤝',
            items,
            collapsed: false
          }
        } catch (e: any) {
          if (e.status === 400) {
            console.error(`Error 400: Datos inválidos al cargar items de pantry ${p.id}`)
          } else if (e.status === 401) {
            console.error(`Error 401: No autorizado para cargar items de pantry ${p.id}`)
          } else if (e.status === 404) {
            console.error(`Error 404: Pantry ${p.id} no encontrada`)
          } else if (e.status === 500) {
            console.error(`Error 500: Error del servidor al cargar items de pantry ${p.id}`)
          } else {
            console.error(`Error al cargar items de pantry ${p.id}:`, e)
          }

          return {
            id: p.id,
            title: p.name,
            emoji: '🤝',
            items: [],
            collapsed: false
          }
        }
      })
    )

    ownPantries.value = ownPantriesWithItems
    sharedPantries.value = sharedPantriesWithItems
  } catch (e: any) {
    if (e.status === 401) {
      error.value = 'No estás autorizado. Por favor, inicia sesión.'
    } else if (e.status === 500) {
      error.value = 'Error del servidor al cargar despensas.'
    } else {
      error.value = e.message || 'Error al cargar despensas'
    }
    console.error('Error al cargar despensas:', e)
  } finally {
    loading.value = false
  }
}

onMounted(fetchPantriesAndItems)

async function confirmAddPantryForm({ name }: { name: string }) {
  if (!name) return
  try {
    const created = await createPantry({ name, metadata: {} })
    ownPantries.value.push({
      id: created.id,
      title: created.name,
      emoji: '🏠',
      items: [],
      collapsed: false
    })
  } catch (e: any) {
    error.value = e.message || 'Error al crear despensa'
  }
  showAddPantry.value = false
}

function cancelAddPantry() {
  showAddPantry.value = false
}

function openAddItem(pantryId: number) {
  addItemTargetId.value = pantryId
  showAddItem.value = true
}

async function confirmAddItemForm({ productId, quantity }: { productId: number; quantity: number }) {
  if (addItemTargetId.value === null || !productId) return

  let pantry = ownPantries.value.find(p => p.id === addItemTargetId.value)
  if (!pantry) {
    pantry = sharedPantries.value.find(p => p.id === addItemTargetId.value)
  }
  if (!pantry) return

  try {
    const existingItem = pantry.items.find(i => i.productId === productId)
    if (existingItem) {
      const newQty = existingItem.qty + quantity
      const updated = await updatePantryItem(pantry.id, existingItem.id, {
        quantity: newQty,
        unit: existingItem.unit || 'unidades' // Mantener la unidad existente o usar 'unidades' por defecto
      })
      existingItem.qty = updated.quantity || newQty
    } else {
      const created = await createPantryItem(pantry.id, {
        product: { id: productId },
        quantity: quantity,
        unit: 'unidades',
        metadata: {}
      })

      const createdEmoji = created.product?.metadata?.emoji || '📦'
      pantry.items.push({
        id: created.id,
        label: created.product?.name || 'Producto',
        emoji: createdEmoji,
        qty: created.quantity || quantity,
        productId: created.product?.id,
        unit: created.unit || 'unidades'
      })
    }

    error.value = null
  } catch (e: any) {
    if (e.status === 400) {
      error.value = 'Datos inválidos. Verifica la información del producto.'
      console.error('Error 400 details:', e)
    } else if (e.status === 401) {
      error.value = 'No tienes autorización para agregar productos a esta despensa.'
    } else if (e.status === 404) {
      error.value = 'Producto o despensa no encontrada.'
    } else if (e.status === 409) {
      error.value = 'El producto ya existe en la despensa o hay un conflicto.'
    } else if (e.status === 500) {
      error.value = 'Error del servidor. Intenta nuevamente.'
    } else {
      error.value = e.message || 'Error al agregar producto a la despensa'
    }
    console.error('Error al agregar producto:', e)
    return
  }

  showAddItem.value = false
  addItemTargetId.value = null
}

async function addSingleToPantry(pantryId: number, productId: number, quantity: number) {
  let pantry = ownPantries.value.find(p => p.id === pantryId)
  if (!pantry) {
    pantry = sharedPantries.value.find(p => p.id === pantryId)
  }
  if (!pantry) throw new Error('Despensa no encontrada')

  const existing = pantry.items.find(i => i.productId === productId)
  if (existing) {
    const newQty = existing.qty + quantity
    const updated = await updatePantryItem(pantry.id, existing.id, { quantity: newQty, unit: existing.unit || 'unidades' })
    existing.qty = updated.quantity || newQty
    return existing
  } else {
    const created = await createPantryItem(pantry.id, { product: { id: productId }, quantity, unit: 'unidades', metadata: {} })
    const createdEmoji = created.product?.metadata?.emoji || '📦'
    const newItem = {
      id: created.id,
      label: created.product?.name || 'Producto',
      emoji: createdEmoji,
      qty: created.quantity || quantity,
      productId: created.product?.id,
      unit: created.unit || 'unidades'
    }
    pantry.items.push(newItem)
    return newItem
  }
}

async function confirmAddItems(payload: { items: { productId: number; quantity: number }[] }) {
  if (addItemTargetId.value === null) return
  const pantryId = addItemTargetId.value
  try {
    for (const it of payload.items) {
      await addSingleToPantry(pantryId, it.productId, it.quantity)
    }
    error.value = null
  } catch (e: any) {
    console.error('Error al agregar múltiples productos:', e)
    error.value = e?.message || 'Error al agregar productos a la despensa'
  } finally {
    showAddItem.value = false
    addItemTargetId.value = null
  }
}

function cancelAddItem() {
  showAddItem.value = false
  addItemTargetId.value = null
}

async function removeItem(pantry: Pantry, item: ItemQty) {
  try {
    await deletePantryItem(pantry.id, item.id)
    pantry.items = pantry.items.filter(i => i.id !== item.id)
  } catch (e: any) {
    error.value = e.message || 'Error al eliminar producto'
  }
}


async function updatePantryTitle(pantry: Pantry, newTitle: string) {
  try {
    const updated = await updatePantry(pantry.id, { name: newTitle, metadata: {} })
    pantry.title = updated.name
  } catch (e: any) {
    error.value = e.message || 'Error al actualizar despensa'
  }
}

async function incQty(pantry: Pantry, item: Item) {
  const itemQty = item as ItemQty
  const newQty = itemQty.qty + 1
  try {
    await updatePantryItem(pantry.id, itemQty.id, {
      quantity: newQty,
      unit: itemQty.unit || 'unidades'
    })
    itemQty.qty = newQty
  } catch (e: any) {
    error.value = e.message || 'Error al actualizar cantidad'
  }
}

async function decQty(pantry: Pantry, item: Item) {
  const itemQty = item as ItemQty
  const newQty = Math.max(0, itemQty.qty - 1)

  if (newQty === 0) {
    await removeItem(pantry, itemQty)
  } else {
    try {
      await updatePantryItem(pantry.id, itemQty.id, {
        quantity: newQty,
        unit: itemQty.unit || 'unidades'
      })
      itemQty.qty = newQty
    } catch (e: any) {
      error.value = e.message || 'Error al actualizar cantidad'
    }
  }
}

function openDeletePantryConfirm(pantry: Pantry) {
  deletingPantry.value = pantry
  showDeletePantryConfirm.value = true
}

async function confirmDeletePantry() {
  if (!deletingPantry.value) return

  try {
    await deletePantry(deletingPantry.value.id)
    ownPantries.value = ownPantries.value.filter(p => p.id !== deletingPantry.value!.id)
    showDeletePantryConfirm.value = false
    deletingPantry.value = null
  } catch (e: any) {
    error.value = e.message || 'Error al eliminar despensa'
    console.error('Error al eliminar despensa:', e)
  }
}

function cancelDeletePantry() {
  showDeletePantryConfirm.value = false
  deletingPantry.value = null
}

async function openSharePantry(pantry: Pantry) {
  sharingPantry.value = pantry
  shareEmail.value = ''
  shareError.value = null
  shareSuccess.value = null
  showSharePantry.value = true

  await loadSharedUsers(pantry.id)
}

async function loadSharedUsers(pantryId: number) {
  loadingSharedUsers.value = true
  try {
    const users = await getSharedUsers(pantryId)
    sharedUsersList.value = Array.isArray(users) ? users : []
  } catch (e: any) {
    console.error('Error al cargar usuarios compartidos:', e)
    sharedUsersList.value = []
  } finally {
    loadingSharedUsers.value = false
  }
}

async function confirmSharePantry() {
  if (!shareEmail.value) {
    shareError.value = 'Ingresa un email para compartir la despensa'
    return
  }

  if (!sharingPantry.value) return

  sharingInProgress.value = true
  shareError.value = null
  shareSuccess.value = null

  try {
    await sharePantry(sharingPantry.value.id, shareEmail.value)

    shareSuccess.value = 'Despensa compartida con éxito'
    shareError.value = null
    shareEmail.value = ''

    await loadSharedUsers(sharingPantry.value.id)
  } catch (e: any) {
    if (e.status === 404) {
      shareError.value = 'Usuario no encontrado'
    } else if (e.status === 409) {
      shareError.value = 'Esta despensa ya está compartida con ese usuario'
    } else {
      shareError.value = e.message || 'Error al compartir despensa'
    }
  } finally {
    sharingInProgress.value = false
  }
}

function cancelSharePantry() {
  showSharePantry.value = false
  sharingPantry.value = null
  shareEmail.value = ''
  shareError.value = null
  shareSuccess.value = null
  sharedUsersList.value = []
}

async function revokeUserAccess(user: SharedUser) {
  try {
    if (!sharingPantry.value) return

    await revokeSharePantry(sharingPantry.value.id, user.id)

    await loadSharedUsers(sharingPantry.value.id)
  } catch (e: any) {
    console.error('Error al revocar acceso:', e)
    shareError.value = e.message || 'Error al revocar acceso'
  }
}
</script>

<style scoped>
.despensa-wrapper {
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
.empty-pantries {
  text-align: center;
  color: #647060;
  font-size: 20px;
  font-style: italic;
  margin: 32px 0 24px 0;
}
.fab-add-pantry {
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
.fab-add-pantry:hover {
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

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>

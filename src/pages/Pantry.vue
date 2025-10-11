<template>
  <BaseLayout>
    <div class="despensa-wrapper">
      <!-- Mis Despensas -->
      <section class="section">
        <h2 class="section-title">Mis Despensas</h2>
        <button class="fab-add-pantry" @click="showAddPantry = true">
          <v-icon size="22" icon="mdi-plus" color="black" style="margin-right:8px" />
          Nueva despensa
        </button>
        <div v-if="loading" class="empty-pantries">
          Cargando...
        </div>
        <div v-else-if="ownPantries.length === 0" class="empty-pantries">
          No hay despensas
        </div>
        <div v-else class="grid">
          <CollapsibleList
            v-for="pantry in ownPantries"
            :key="pantry.id"
            :title="pantry.title"
            :items="pantry.items"
            v-model:collapsed="pantry.collapsed"
            @add="() => openAddItem(pantry.id)"
            @remove="(item) => removeItem(pantry, item as any)"
            @edit="() => editPantry(pantry)"
            @update:title="(newTitle) => updatePantryTitle(pantry, newTitle)"
            item-key-field="id"
          >
            <template #header-actions="{ toggle, collapsed }">
              <button class="icon-btn" aria-label="Agregar" @click="openAddItem(pantry.id)">
                <v-icon size="22" icon="mdi-plus" />
              </button>
              <button class="icon-btn" aria-label="Editar" @click="editPantry(pantry)">
                <v-icon size="22" icon="mdi-pencil-outline" />
              </button>
              <button class="icon-btn" aria-label="Eliminar despensa" @click="deletePantryHandler(pantry)">
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
                :onRemove="() => removeItem(pantry, item as any)"
              />
            </template>
            <template #empty>No hay productos</template>
          </CollapsibleList>
        </div>
      </section>

      <!-- Despensas Compartidas Conmigo -->
      <section class="section">
        <h2 class="section-title">Despensas Compartidas Conmigo</h2>
        <div v-if="loading" class="empty-pantries">
          Cargando...
        </div>
        <div v-else-if="sharedPantries.length === 0" class="empty-pantries">
          No hay despensas compartidas
        </div>
        <div v-else class="grid">
          <CollapsibleList
            v-for="pantry in sharedPantries"
            :key="pantry.id"
            :title="pantry.title"
            :items="pantry.items"
            v-model:collapsed="pantry.collapsed"
            @add="() => openAddItem(pantry.id)"
            @remove="(item) => removeItem(pantry, item as any)"
            @update:title="(newTitle) => updatePantryTitle(pantry, newTitle)"
            item-key-field="id"
          >
            <template #header-actions="{ toggle, collapsed }">
              <button class="icon-btn" aria-label="Agregar" @click="openAddItem(pantry.id)">
                <v-icon size="22" icon="mdi-plus" />
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
                :onRemove="() => removeItem(pantry, item as any)"
              />
            </template>
            <template #empty>No hay productos</template>
          </CollapsibleList>
        </div>
      </section>

      <div v-if="showAddPantry">
        <NewCategoryForm
          @add="confirmAddPantryForm"
          @cancel="cancelAddPantry"
        />
      </div>
      <div v-if="showAddItem">
        <NewProductForm
          @add="confirmAddItemForm"
          @cancel="cancelAddItem"
        />
      </div>
    </div>
  </BaseLayout>
</template>

<script setup lang="ts">
import BaseLayout from '@/layouts/BaseLayout.vue'
import CollapsibleList from '@/components/lists/CollapsibleList.vue'
import ItemQtyActions from '@/components/ItemQtyActions.vue'
import NewProductForm from '@/components/NewProductForm.vue'
import NewCategoryForm from '@/components/NewCategoryForm.vue'
import { ref, onMounted } from 'vue'
import { getPantries, createPantry, updatePantry, deletePantry, getPantryItems, createPantryItem, updatePantryItem, deletePantryItem } from '@/utils/api'

type Item = { id: number; label: string; emoji?: string }
type ItemQty = Item & { qty: number; productId?: number }
type Pantry = {
  id: number
  title: string
  emoji: string
  items: ItemQty[]
  collapsed: boolean
}

const ownPantries = ref<Pantry[]>([])
const sharedPantries = ref<Pantry[]>([])
const showAddPantry = ref(false)
const showAddItem = ref(false)
const addItemTargetId = ref<number | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

async function fetchPantriesAndItems() {
  loading.value = true
  error.value = null
  try {
    // Fetch own pantries (owner=true)
    const ownResponse = await getPantries({ page: 1, per_page: 100, order: 'ASC', sort_by: 'createdAt', owner: true })
    const ownPantriesData = ownResponse.data || []

    // Fetch shared pantries (owner=false)
    const sharedResponse = await getPantries({ page: 1, per_page: 100, order: 'ASC', sort_by: 'createdAt', owner: false })
    const sharedPantriesData = sharedResponse.data || []

    // Fetch items for own pantries
    const ownPantriesWithItems = await Promise.all(
      ownPantriesData.map(async (p: any) => {
        try {
          const itemsResponse = await getPantryItems(p.id, { page: 1, per_page: 100 })
          const items = (itemsResponse.data || []).map((item: any) => ({
            id: item.id,
            label: item.product?.name || 'Producto',
            emoji: item.product?.metadata?.emoji || '📦',
            qty: item.quantity || 1,
            productId: item.product?.id
          }))
          return {
            id: p.id,
            title: p.name,
            emoji: '🏠',
            items,
            collapsed: false
          }
        } catch (e) {
          console.error(`Error al cargar items de pantry ${p.id}:`, e)
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

    // Fetch items for shared pantries
    const sharedPantriesWithItems = await Promise.all(
      sharedPantriesData.map(async (p: any) => {
        try {
          const itemsResponse = await getPantryItems(p.id, { page: 1, per_page: 100 })
          const items = (itemsResponse.data || []).map((item: any) => ({
            id: item.id,
            label: item.product?.name || 'Producto',
            emoji: item.product?.metadata?.emoji || '📦',
            qty: item.quantity || 1,
            productId: item.product?.id
          }))
          return {
            id: p.id,
            title: p.name,
            emoji: '🤝',
            items,
            collapsed: false
          }
        } catch (e) {
          console.error(`Error al cargar items de pantry ${p.id}:`, e)
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
    error.value = e.message || 'Error al cargar despensas'
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

async function confirmAddItemForm({ name, emoji }: { name: string; emoji: string }) {
  if (addItemTargetId.value === null || !name) return

  // Find pantry in either own or shared list
  let pantry = ownPantries.value.find(p => p.id === addItemTargetId.value)
  if (!pantry) {
    pantry = sharedPantries.value.find(p => p.id === addItemTargetId.value)
  }
  if (!pantry) return

  try {
    // Create item in pantry
    const created = await createPantryItem(pantry.id, {
      product: { name },
      quantity: 1,
      metadata: emoji ? { emoji } : {}
    })

    const createdEmoji = created.product?.metadata?.emoji || emoji || '📦'
    pantry.items.push({
      id: created.id,
      label: created.product?.name || name,
      emoji: createdEmoji,
      qty: created.quantity || 1,
      productId: created.product?.id
    })
  } catch (e: any) {
    error.value = e.message || 'Error al crear producto'
  }

  showAddItem.value = false
  addItemTargetId.value = null
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

function editPantry(pantry: Pantry) {
  // Reserved for future
  console.log('Edit pantry:', pantry)
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
    await updatePantryItem(pantry.id, itemQty.id, { quantity: newQty })
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
      await updatePantryItem(pantry.id, itemQty.id, { quantity: newQty })
      itemQty.qty = newQty
    } catch (e: any) {
      error.value = e.message || 'Error al actualizar cantidad'
    }
  }
}

async function deletePantryHandler(pantry: Pantry) {
  if (!confirm(`¿Estás seguro de eliminar la despensa "${pantry.title}"?`)) {
    return
  }

  try {
    await deletePantry(pantry.id)
    ownPantries.value = ownPantries.value.filter(p => p.id !== pantry.id)
  } catch (e: any) {
    error.value = e.message || 'Error al eliminar despensa'
    console.error('Error al eliminar despensa:', e)
  }
}
</script>

<style scoped>
.despensa-wrapper {
  max-width: 980px;
  margin: 0 auto;
  padding: 24px 16px;
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
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  margin: 0 4px;
  color: #000;
  transition: color 0.2s;
}
.icon-btn:hover {
  color: #007bff;
}
</style>

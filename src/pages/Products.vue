<template>
  <BaseLayout>
    <div class="products-wrapper">
      <section class="section">
        <h2 class="section-title">Productos</h2>
        <div style="margin: 10px 6px 18px;">
          <SearchBar v-model="searchQuery" placeholder="Buscar productos" />
        </div>
        <button class="fab-add-category" @click="showAddCategory = true">
          <v-icon size="22" icon="mdi-plus" color="black" style="margin-right:8px" />
          Nueva categoría
        </button>
        <div v-if="loading" class="empty-products">
          Cargando...
        </div>
        <div v-else-if="categories.length === 0" class="empty-products">
          No hay productos
        </div>
        <div v-else-if="visibleCategories.length === 0 && searchQuery" class="empty-products">
          No se encontraron resultados
        </div>
        <div v-else class="grid">
          <CollapsibleList
            v-for="cat in visibleCategories"
            :key="cat.id"
            :title="cat.title"
            :items="filteredItems(cat)"
            v-model:collapsed="cat.collapsed"
            @add="() => openAddProduct(cat.id)"
            @edit="() => editCategory()"
            @remove="(item) => removeItem(cat, item as any)"
            @edit-item="(item) => openEditProduct(cat, item as any)"
            @update:title="(newTitle) => updateCategoryTitle(cat, newTitle)"
          >
            <template #header-actions="{ toggle, collapsed, startEdit }">
              <button class="icon-btn" aria-label="Agregar" @click="openAddProduct(cat.id)">
                <v-icon size="22" icon="mdi-plus" />
              </button>
              <button class="icon-btn" aria-label="Editar" @click="startEdit()">
                <v-icon size="22" icon="mdi-pencil-outline" />
              </button>
              <button class="icon-btn" aria-label="Eliminar categoría" @click="openDeleteCategoryConfirm(cat)">
                <v-icon size="22" icon="mdi-trash-can-outline" />
              </button>
              <button class="icon-btn" :aria-label="collapsed ? 'Expandir' : 'Contraer'" @click="toggle()">
                <v-icon size="22" :icon="collapsed ? 'mdi-chevron-down' : 'mdi-chevron-up'" />
              </button>
            </template>
            <template #item-left="{ item }">
              <span class="emoji">{{ item.emoji || cat.emoji }}</span>
            </template>
          </CollapsibleList>
        </div>
        <div v-if="showAddCategory">
          <NewCategoryForm
            @add="confirmAddCategoryForm"
            @cancel="cancelAddCategory"
          />
        </div>
        <div v-if="showAddProduct">
          <NewProductForm
            @add="confirmAddProductForm"
            @cancel="cancelAddProduct"
          />
        </div>
        <div v-if="showEditProduct">
          <NewProductForm
            :edit="true"
            :initial-name="editProductTarget!.item.label"
            :initial-emoji="editProductTarget!.item.emoji"
            @confirm="confirmEditProductForm"
            @cancel="cancelEditProduct"
          />
        </div>
        <!-- Reusable delete modal for Category -->
        <ConfirmDeleteModal
          v-if="showDeleteCategoryConfirm"
          title="Eliminar Categoría"
          :submessage="'Esta acción no se puede deshacer.'"
          @confirm="confirmDeleteCategory"
          @cancel="cancelDeleteCategory"
        >
          <template #message>
            ¿Estás seguro de que deseas eliminar la categoría "<strong>{{ deletingCategory?.title }}</strong>"?
          </template>
        </ConfirmDeleteModal>
      </section>
    </div>
  </BaseLayout>
</template>



<script setup lang="ts">

import BaseLayout from "@/layouts/BaseLayout.vue";
import CollapsibleList from '@/components/lists/CollapsibleList.vue'
import NewProductForm from '@/components/NewProductForm.vue'
import NewCategoryForm from '@/components/NewCategoryForm.vue'
import SearchBar from '@/components/SearchBar.vue'
import ConfirmDeleteModal from '@/components/ConfirmDeleteModal.vue'
import { ref, onMounted, computed } from 'vue'
import { getProducts, createProduct, updateProduct, deleteProduct, getCategories, createCategory, updateCategory, deleteCategory } from '@/utils/api'

type Item = { id: number; label: string; emoji: string }
interface Category { id: number; title: string; emoji: string; items: Item[]; collapsed: boolean }

const categories = ref<Category[]>([])
const showAddCategory = ref(false)
const addProductTarget = ref<number | null>(null)
const showAddProduct = ref(false)
const editProductTarget = ref<{ catId: number, item: Item } | null>(null)
const showEditProduct = ref(false)
const loading = ref(false)
const error = ref<string | null>(null)
const showDeleteCategoryConfirm = ref(false)
const deletingCategory = ref<Category | null>(null)

// búsqueda
const searchQuery = ref('')
const normalize = (s: string) => (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

function filteredItems(cat: Category) {
  const q = normalize(searchQuery.value)
  if (!q) return cat.items
  const titleMatch = normalize(cat.title).includes(q)
  if (titleMatch) return cat.items
  return cat.items.filter(i => normalize(i.label).includes(q) || (i.emoji && i.emoji.includes(searchQuery.value)))
}

const visibleCategories = computed(() => {
  const q = normalize(searchQuery.value)
  if (!q) return categories.value
  return categories.value.filter(c => filteredItems(c).length > 0)
})

async function fetchCategoriesAndProducts() {
  loading.value = true
  error.value = null
  try {
    const [cats, prods] = await Promise.all([
      getCategories({ page: 1, per_page: 100, order: 'ASC', sort_by: 'createdAt' }),
      getProducts({ page: 1, per_page: 100, order: 'ASC', sort_by: 'name' })
    ])
    //Mapa de categorias
    const map = new Map<number, Category>()
    for (const c of cats as any[]) {
      map.set(c.id, { id: c.id, title: c.name, emoji: '📦', items: [], collapsed: false })
    }
    for (const p of prods as any[]) {
      const catId = p.category?.id
      if (!catId) continue
      if (!map.has(catId)) {
        map.set(catId, { id: catId, title: p.category?.name || 'Categoría', emoji: '📦', items: [], collapsed: false })
      }
      const pEmoji = (p.metadata && (p.metadata.emoji as string)) || '🆕'
      map.get(catId)!.items.push({ id: p.id, label: p.name, emoji: pEmoji })
    }
    categories.value = Array.from(map.values())
  } catch (e: any) {
    error.value = e.message || 'Error al cargar datos'
  } finally {
    loading.value = false
  }
}

onMounted(fetchCategoriesAndProducts)

function openAddProduct(categoryId: number) {
  addProductTarget.value = categoryId
  showAddProduct.value = true
}
async function confirmAddProductForm({ name, emoji }: { name: string; emoji: string }) {
  if (addProductTarget.value === null || !name) return
  const cat = categories.value.find(c => c.id === addProductTarget.value)
  if (!cat) return
  try {
    const payload = {
      name,
      category: { id: cat.id },
      metadata: emoji ? { emoji } : {}
    }
    const created = await createProduct(payload)
    const createdEmoji = (created.metadata && (created.metadata.emoji as string)) || emoji || '🆕'
    cat.items.push({ id: created.id, label: created.name, emoji: createdEmoji })
  } catch (e: any) {
    error.value = e.message || 'Error al crear producto'
  }
  showAddProduct.value = false
  addProductTarget.value = null
}
function cancelAddProduct() {
  showAddProduct.value = false
  addProductTarget.value = null
}

async function confirmAddCategoryForm({ name }: { name: string }) {
  if (!name) return
  try {
    const created = await createCategory({ name, metadata: {} })
    categories.value.push({ id: created.id, title: created.name, emoji: '📦', items: [], collapsed: false })
  } catch (e: any) {
    error.value = e.message || 'Error al crear categoría'
  }
  showAddCategory.value = false
}
function cancelAddCategory() {
  showAddCategory.value = false
}

function editCategory() {}
async function removeItem(cat: any, item: Item) {
  const index = categories.value.findIndex(c => c.id === cat.id)
  if (index !== -1 && categories.value[index]?.items) {
    try {
      await deleteProduct(item.id)
      categories.value[index].items = categories.value[index].items.filter(i => i.id !== item.id)
    } catch (e: any) {
      error.value = e.message || 'Error al eliminar producto'
    }
  }
}
function openEditProduct(cat: any, item: Item) {
  editProductTarget.value = { catId: cat.id, item }
  showEditProduct.value = true
}
async function confirmEditProductForm({ name, emoji }: { name: string; emoji: string }) {
  if (!editProductTarget.value || !name) return
  const cat = categories.value.find(c => c.id === editProductTarget.value!.catId)
  if (!cat) return
  const prod = cat.items.find((i: Item) => i.id === editProductTarget.value!.item.id)
  if (!prod) return
  try {
    await updateProduct(prod.id, {
      name,
      category: { id: cat.id },
      metadata: emoji ? { emoji } : {}
    })
    // local update para reflejar los cambios ni bien se hacen
    prod.label = name
    if (emoji) {
      prod.emoji = emoji
    }
  } catch (e: any) {
    error.value = e.message || 'Error al actualizar producto'
  }
  showEditProduct.value = false
  editProductTarget.value = null
}
function cancelEditProduct() {
  showEditProduct.value = false
  editProductTarget.value = null
}
async function updateCategoryTitle(cat: Category, newTitle: string) {
  try {
    const updated = await updateCategory(cat.id, { name: newTitle, metadata: {} })
    const category = categories.value.find(c => c.id === cat.id)
    if (category) category.title = updated.name
  } catch (e: any) {
    error.value = e.message || 'Error al actualizar categoría'
  }
}

function openDeleteCategoryConfirm(cat: Category) {
  deletingCategory.value = cat
  showDeleteCategoryConfirm.value = true
}
async function confirmDeleteCategory() {
  if (!deletingCategory.value) return
  try {
    await deleteCategory(deletingCategory.value.id)
    categories.value = categories.value.filter(c => c.id !== deletingCategory.value!.id)

    if (addProductTarget.value === deletingCategory.value.id) {
      addProductTarget.value = null
      showAddProduct.value = false
    }
    if (editProductTarget.value && editProductTarget.value.catId === deletingCategory.value.id) {
      editProductTarget.value = null
      showEditProduct.value = false
    }

    showDeleteCategoryConfirm.value = false
    deletingCategory.value = null
  } catch (e: any) {
    if ((e as any).status === 409) {
      error.value = 'No se puede eliminar la categoría porque tiene productos asociados'
    } else if ((e as any).status === 404) {
      error.value = 'La categoría no existe o no te pertenece'
    } else {
      error.value = (e as any).message || 'Error al eliminar categoría'
    }
  }
}
function cancelDeleteCategory() {
  showDeleteCategoryConfirm.value = false
  deletingCategory.value = null
}
</script>

<style scoped>
.products-wrapper {
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
  font-size: 26px;
  width: 30px;
  display: inline-block;
  text-align: center;
}
.empty-products {
  text-align: center;
  color: #647060;
  font-size: 20px;
  font-style: italic;
  margin: 32px 0 24px 0;
}
.fab-add-category {
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
.fab-add-category:hover {
  box-shadow: 0 4px 16px rgba(0,0,0,0.28);
}
</style>

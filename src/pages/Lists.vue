<template>
  <BaseLayout>
    <div class="products-wrapper">
      <section class="section">
        <h2 class="section-title">Mis Listas</h2>
        <button class="fab-add-category" @click="showAddCategory = true">
          <v-icon size="22" icon="mdi-plus" color="black" style="margin-right:8px" />
          Nueva Lista
        </button>
        <div v-if="categories.length === 0" class="empty-products">
          No hay Listas
        </div>
        <div v-else class="grid">
          <CollapsibleList
            v-for="cat in categories"
            :key="cat.id"
            :title="cat.title"
            :items="cat.items"
            v-model:collapsed="cat.collapsed"
            @add="() => openAddProduct(cat.id)"
            @edit="() => editCategory(cat)"
            @remove="(item) => removeItem(cat, item)"
            @edit-item="(item) => openEditProduct(cat, item)"
            @update:title="(newTitle) => updateCategoryTitle(cat, newTitle)"
          >
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
      </section>
    </div>
  </BaseLayout>
</template>

<script setup lang="ts">
import BaseLayout from "@/layouts/BaseLayout.vue";
import CollapsibleList from '@/components/lists/CollapsibleList.vue'
import NewProductForm from '@/components/NewProductForm.vue'
import NewCategoryForm from '@/components/NewCategoryForm.vue'
import { ref, onMounted } from 'vue'

interface Item {
  id: number;
  label: string;
  emoji?: string;
  icon?: string;
  [key: string]: unknown;
}
interface Category { id: number; title: string; emoji: string; items: Item[]; collapsed: boolean }

const categories = ref<Category[]>([])
const showAddCategory = ref(false)
const addProductTarget = ref<number | null>(null)
const showAddProduct = ref(false)
const editProductTarget = ref<{ catId: number, item: Item } | null>(null)
const showEditProduct = ref(false)
const loading = ref(false)
const error = ref<string | null>(null)

async function fetchCategoriesAndProducts() {
  loading.value = true
  error.value = null
  try {
    categories.value = [
      {
        id: 1,
        title: 'Lista de Compras',
        emoji: '🛒',
        items: [
          { id: 1, label: 'Pan', emoji: '🍞' },
          { id: 2, label: 'Leche', emoji: '🥛' },
        ],
        collapsed: false
      },
      {
        id: 2,
        title: 'Lista del Super',
        emoji: '🏪',
        items: [
          { id: 3, label: 'Frutas', emoji: '🍎' },
          { id: 4, label: 'Verduras', emoji: '🥬' },
        ],
        collapsed: false
      }
    ]
  } catch (e: any) {
    error.value = e.message || 'Error al cargar las listas'
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
    const newItem = {
      id: Date.now(),
      label: name,
      emoji: emoji || '🆕'
    }
    cat.items.push(newItem)
  } catch (e: any) {
    error.value = e.message || 'Error al agregar item a la lista'
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
    const newCategory = {
      id: Date.now(),
      title: name,
      emoji: '📝',
      items: [],
      collapsed: false
    }
    categories.value.push(newCategory)
  } catch (e: any) {
    error.value = e.message || 'Error al crear lista'
  }
  showAddCategory.value = false
}

function cancelAddCategory() {
  showAddCategory.value = false
}

function editCategory(cat: Category) { /* reserved for future */ }

async function removeItem(cat: Category, item: Item) {
  const index = categories.value.findIndex(c => c.id === cat.id)
  if (index !== -1 && categories.value[index]?.items) {
    try {
      categories.value[index].items = categories.value[index].items.filter(i => i.id !== item.id)
    } catch (e: any) {
      error.value = e.message || 'Error al eliminar item'
    }
  }
}

function openEditProduct(cat: Category, item: Item) {
  editProductTarget.value = { catId: cat.id, item }
  showEditProduct.value = true
}

async function confirmEditProductForm({ name, emoji }: { name: string; emoji: string }) {
  if (!editProductTarget.value || !name) return
  const cat = categories.value.find(c => c.id === editProductTarget.value!.catId)
  if (!cat) return
  const item = cat.items.find(i => i.id === editProductTarget.value!.item.id)
  if (!item) return
  try {
    item.label = name
    item.emoji = emoji || item.emoji
  } catch (e: any) {
    error.value = e.message || 'Error al actualizar item'
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
    const category = categories.value.find(c => c.id === cat.id)
    if (category) category.title = newTitle
  } catch (e: any) {
    error.value = e.message || 'Error al actualizar título de la lista'
  }
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



function cancelAddItem() {
  showAddItem.value = false
  addItemTarget.value = null
}

async function confirmAddList({ name }: { name: string }) {
  if (!name) return
  try {
    // Aquí iría la llamada a la API para crear una nueva lista
    const newList = {
      id: Date.now(), // Temporalmente usando timestamp como ID
      title: name,
      emoji: '�',
      items: [],
      collapsed: false
    }
    lists.value.push(newList)
  } catch (e: any) {
    error.value = e.message || 'Error al crear lista'
  }
  showAddList.value = false
}

function cancelAddList() {
  showAddList.value = false
}

function editList(list: List) { /* reserved for future */ }

async function removeItem(list: List, item: ListItem) {
  const index = lists.value.findIndex(l => l.id === list.id)
  if (index !== -1 && lists.value[index]?.items) {
    try {
      // Aquí iría la llamada a la API para eliminar el item
      lists.value[index].items = lists.value[index].items.filter(i => i.id !== item.id)
    } catch (e: any) {
      error.value = e.message || 'Error al eliminar item'
    }
  }
}

function openEditItem(list: List, item: ListItem) {
  editItemTarget.value = { listId: list.id, item }
  showEditItem.value = true
}

async function confirmEditItem({ name }: { name: string }) {
  if (!editItemTarget.value || !name) return
  const list = lists.value.find(l => l.id === editItemTarget.value!.listId)
  if (!list) return
  const item = list.items.find(i => i.id === editItemTarget.value!.item.id)
  if (!item) return
  try {
    // Aquí iría la llamada a la API para actualizar el item
    item.label = name
  } catch (e: any) {
    error.value = e.message || 'Error al actualizar item'
  }
  showEditItem.value = false
  editItemTarget.value = null
}

function cancelEditItem() {
  showEditItem.value = false
  editItemTarget.value = null
}

async function updateListTitle(list: List, newTitle: string) {
  try {
    // Aquí iría la llamada a la API para actualizar el título de la lista
    const listToUpdate = lists.value.find(l => l.id === list.id)
    if (listToUpdate) listToUpdate.title = newTitle
  } catch (e: any) {
    error.value = e.message || 'Error al actualizar título de la lista'
  }
}

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

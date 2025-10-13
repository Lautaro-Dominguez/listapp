<template>
  <div class="modal-bg" @click="$emit('cancel')">
    <div class="modal" @click.stop>
      <h3>{{ title || 'Agregar Productos' }}</h3>

      <div v-if="loading" class="loading">
        Cargando productos...
      </div>

      <div v-else-if="categories.length === 0" class="empty">
        No hay productos disponibles. Crea productos en la sección "Productos" primero.
      </div>

      <div v-else class="products-container">
        <div v-for="category in categories" :key="category.id" class="category-section">
          <h4 class="category-title">{{ category.title }}</h4>
          <div class="products-grid">
            <div
              v-for="product in category.items"
              :key="product.id"
              class="product-card"
              :class="{ selected: isProductSelected(product.id) }"
              @click="toggleProduct(product)"
            >
              <span class="product-emoji">{{ product.emoji }}</span>
              <span class="product-name">{{ product.label }}</span>
              <div v-if="isProductSelected(product.id)" class="selected-indicator" title="Seleccionado">
                ✓
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="selectedProducts.length > 0" class="selected-section">
        <h4>Productos seleccionados:</h4>
        <div class="selected-list">
          <div v-for="item in selectedProducts" :key="item.productId" class="selected-item">
            <span class="selected-emoji">{{ item.emoji }}</span>
            <span class="selected-name">{{ item.label }}</span>
            <button @click="removeProduct(item.productId)" class="remove-btn" title="Eliminar">
              ×
            </button>
          </div>
        </div>
      </div>

      <div v-if="error" class="error-message">{{ error }}</div>

      <div class="modal-actions">
        <button
          @click="confirmAdd"
          :disabled="selectedProducts.length === 0"
          class="btn-primary"
        >
          Agregar {{ selectedProducts.length > 0 ? `(${selectedProducts.length})` : '' }}
        </button>
        <button @click="$emit('cancel')" class="btn-secondary">Cancelar</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getCategories, getProducts } from '@/utils/api'

type Item = { id: number; label: string; emoji: string }
type Category = { id: number; title: string; items: Item[] }
type SelectedProduct = { productId: number; label: string; emoji: string }

const props = defineProps<{
  title?: string
}>()

const emit = defineEmits<{
  add: [payload: { productId: number; quantity: number }]
  addMultiple: [payload: { items: { productId: number; quantity: number }[] }]
  cancel: []
}>()

const categories = ref<Category[]>([])
const selectedProducts = ref<SelectedProduct[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

async function fetchCategoriesAndProducts() {
  loading.value = true
  error.value = null
  try {
    const [cats, prods] = await Promise.all([
      getCategories({ page: 1, per_page: 100, order: 'ASC', sort_by: 'createdAt' }),
      getProducts({ page: 1, per_page: 100, order: 'ASC', sort_by: 'name' })
    ])

    const map = new Map<number, Category>()
    for (const c of cats as any[]) {
      map.set(c.id, { id: c.id, title: c.name, items: [] })
    }

    for (const p of prods as any[]) {
      const catId = p.category?.id
      if (!catId) continue
      if (!map.has(catId)) {
        map.set(catId, { id: catId, title: p.category?.name || 'Categoría', items: [] })
      }
      const pEmoji = (p.metadata && (p.metadata.emoji as string)) || '📦'
      map.get(catId)!.items.push({ id: p.id, label: p.name, emoji: pEmoji })
    }

    categories.value = Array.from(map.values()).filter(cat => cat.items.length > 0)
  } catch (e: any) {
    error.value = e.message || 'Error al cargar productos'
  } finally {
    loading.value = false
  }
}

function isProductSelected(productId: number): boolean {
  return selectedProducts.value.some(p => p.productId === productId)
}

function toggleProduct(product: Item) {
  const index = selectedProducts.value.findIndex(p => p.productId === product.id)
  if (index >= 0) {
    selectedProducts.value.splice(index, 1)
  } else {
    selectedProducts.value.push({
      productId: product.id,
      label: product.label,
      emoji: product.emoji
    })
  }
}

function removeProduct(productId: number) {
  const index = selectedProducts.value.findIndex(p => p.productId === productId)
  if (index >= 0) {
    selectedProducts.value.splice(index, 1)
  }
}

function confirmAdd() {
  if (selectedProducts.value.length === 0) {
    error.value = 'Selecciona al menos un producto'
    return
  }

  const items = selectedProducts.value.map(item => ({ productId: item.productId, quantity: 1 }))
  emit('addMultiple', { items })
}

onMounted(fetchCategoriesAndProducts)
</script>

<style scoped>
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
  min-width: 500px;
  max-width: 700px;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.18);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.modal h3 {
  margin: 0 0 8px;
  font-size: 20px;
  color: #1f1f1f;
  text-align: center;
}

.loading,
.empty {
  text-align: center;
  color: #647060;
  font-size: 16px;
  padding: 24px 0;
}

.products-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.category-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.category-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
  border-bottom: 2px solid #9bd166;
  padding-bottom: 6px;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
}

.product-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  background: #fff;
}

.product-card:hover {
  border-color: #9bd166;
  box-shadow: 0 2px 8px rgba(155, 209, 102, 0.2);
  transform: translateY(-2px);
}

.product-card.selected {
  border-color: #9bd166;
  background: #f0f8e8;
  box-shadow: 0 2px 8px rgba(155, 209, 102, 0.3);
}

.product-emoji {
  font-size: 32px;
}

.product-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  text-align: center;
  word-wrap: break-word;
  max-width: 100%;
}

.selected-indicator {
  position: absolute;
  top: 8px;
  right: 8px;
  background: #9bd166;
  color: #fff;
  font-weight: 700;
  font-size: 12px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.selected-section {
  border-top: 1px solid #e0e0e0;
  padding-top: 16px;
}

.selected-section h4 {
  margin: 0 0 12px;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.selected-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.selected-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: #f5f5f5;
  border-radius: 6px;
}

.selected-emoji {
  font-size: 24px;
}

.selected-name {
  flex: 1;
  font-size: 15px;
  font-weight: 500;
  color: #333;
}

.remove-btn {
  width: 28px;
  height: 28px;
  border-radius: 4px;
  border: 1px solid #e74c3c;
  background: #fff;
  color: #e74c3c;
  font-size: 20px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.remove-btn:hover {
  background: #e74c3c;
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

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 8px;
}

.modal-actions button {
  padding: 10px 24px;
  border-radius: 8px;
  border: none;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #000;
  color: #fff;
}

.btn-primary:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.btn-primary:hover:not(:disabled) {
  background: #333;
}

.btn-secondary {
  background: #eee;
  color: #222;
}

.btn-secondary:hover {
  background: #ddd;
}
</style>

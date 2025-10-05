<template>
  <div class="despensa-wrapper">
    <section class="section">
      <h2 class="section-title">Mi Despensa</h2>
      <div v-if="categorias.length === 0" class="empty-categories">
        No hay categorías
      </div>
      <div v-else class="grid">
        <CollapsibleList
          v-for="cat in categorias"
          :key="cat.id"
          :title="cat.title"
          :items="cat.items"
          v-model:collapsed="cat.collapsed"
          @add="() => addItem(cat)"
          @remove="(item) => removeItem(cat, item)"
          @edit="() => editCategoria(cat)"
          item-key-field="id"
        >
          <template #item-left="{ item }">
            <span class="emoji">{{ item.emoji || cat.emoji }}</span>
          </template>
          <template #item-right="{ item }">
            <ItemQtyActions
              :item="item as ItemQty"
              :onInc="incQty"
              :onDec="decQty"
              :onRemove="(item) => removeItem(cat, item)"
            />
          </template>
          <template #empty>No hay productos</template>
        </CollapsibleList>
      </div>
    </section>
    <button class="fab-add-category" @click="showAddCat = true">
      <v-icon size="22" icon="mdi-plus" color="black" style="margin-right:8px" />
      Nueva categoría
    </button>
    <div v-if="showAddCat" class="modal-bg">
      <div class="modal">
        <h3>Nueva categoría</h3>
        <label>Nombre:<input v-model="newCatName" placeholder="Nombre de la categoría" /></label>
        <div class="modal-actions">
          <button @click="addCategoria">Agregar</button>
          <button @click="showAddCat = false">Cancelar</button>
        </div>
      </div>
    </div>
    <div v-if="showAddProduct" class="modal-bg">
      <div class="modal">
        <h3>Nuevo producto</h3>
        <label>Nombre:<input v-model="newProductName" placeholder="Nombre del producto" /></label>
        <label>Emoji:<input v-model="newProductEmoji" maxlength="2" placeholder="Emoji" style="text-align:center;" /></label>
        <div class="modal-actions">
          <button @click="confirmAddProduct">Agregar</button>
          <button @click="cancelAddProduct">Cancelar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import CollapsibleList from '@/components/lists/CollapsibleList.vue'
import ItemQtyActions from '@/components/ItemQtyActions.vue'
import { ref, reactive } from 'vue'

type Item = { id: number; label: string; emoji?: string }
type ItemQty = Item & { qty: number }
type Categoria = {
  id: number
  title: string
  emoji: string
  items: ItemQty[]
  collapsed: boolean
}

const categorias = reactive<Categoria[]>([])

const showAddCat = ref(false)
const newCatName = ref('')
const newCatEmoji = ref('')

const showAddProduct = ref(false)
const newProductName = ref('')
const newProductEmoji = ref('')
let addProductCat: Categoria | null = null

function nextCatId() {
  return Math.max(...categorias.map(c => c.id), 0) + 1
}
function nextItemId(cat: Categoria) {
  return Math.max(0, ...cat.items.map(i => i.id)) + 1
}

function addCategoria() {
  if (!newCatName.value.trim()) return
  categorias.push({
    id: nextCatId(),
    title: newCatName.value.trim(),
    emoji: newCatEmoji.value.trim() || '📦',
    items: [],
    collapsed: false,
  })
  newCatName.value = ''
  newCatEmoji.value = ''
  showAddCat.value = false
}

function openAddProduct(cat: Categoria) {
  addProductCat = cat
  newProductName.value = ''
  newProductEmoji.value = ''
  showAddProduct.value = true
}
function confirmAddProduct() {
  if (!addProductCat || !newProductName.value.trim()) return
  addProductCat.items.push({
    id: nextItemId(addProductCat),
    label: newProductName.value.trim(),
    qty: 1,
    emoji: newProductEmoji.value.trim() || '🛒',
  })
  showAddProduct.value = false
  newProductName.value = ''
  newProductEmoji.value = ''
  addProductCat = null
}
function cancelAddProduct() {
  showAddProduct.value = false
  newProductName.value = ''
  newProductEmoji.value = ''
  addProductCat = null
}

function addItem(cat: Categoria) {
  openAddProduct(cat)
}
function removeItem(cat: Categoria, item: ItemQty) {
  cat.items = cat.items.filter(i => i.id !== item.id)
}
function editCategoria(cat: Categoria) {
  alert('Funcionalidad para editar la categoría: ' + cat.title)
}
function incQty(item: Item) { (item as ItemQty).qty++ }
function decQty(item: Item) {
  const itemQty = item as ItemQty;
  itemQty.qty = Math.max(0, itemQty.qty - 1);
  if (itemQty.qty === 0) {
    for (const cat of categorias) {
      if (cat.items.some(i => i.id === itemQty.id)) {
        removeItem(cat, itemQty)
        break
      }
    }
  }
}
</script>

<style scoped>
.despensa-wrapper { max-width: 980px; margin: 0 auto; padding: 24px 16px; }
.section { margin-bottom: 36px; }
.section-title { margin: 8px 6px 12px; font-weight: 700; font-size: 24px; color: #000; }
.grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 16px; }
.emoji { font-size: 24px; width: 30px; display: inline-block; text-align: center; }
.qty-actions { display: inline-flex; align-items: center; gap: 8px; }
.qty { min-width: 28px; text-align: center; font-weight: 700; color: #000; }
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
.modal-bg {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.18);
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
  box-shadow: 0 2px 16px rgba(0,0,0,0.18);
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.modal h3 { margin: 0 0 8px; font-size: 20px; color: #1f1f1f; justify-content: center; text-align: center;}
.modal label { display: flex; flex-direction: column; gap: 2px; font-size: 15px; }
.modal input {
  font-size: 16px;
  padding: 4px 8px;
  border-radius: 6px;
  border: 1px solid #bbb;
  color: #222;
  background: #fff;
}
.modal-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 8px; }
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
.empty-categories {
  text-align: center;
  color: #647060;
  font-size: 20px;
  font-style: italic;
  margin: 32px 0 24px 0;
}
</style>

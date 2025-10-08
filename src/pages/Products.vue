<template>
  <BaseLayout>
    <div class="products-wrapper">
      <section class="section">
        <h2 class="section-title">Mis Productos</h2>
        <div v-if="productos.length === 0" class="empty-products">
          No hay productos
        </div>
        <div v-else class="grid">
          <CollapsibleList
            title="Frutas"
            :items="frutas"
            v-model:collapsed="collapsedFrutas"
            @add="addFruta"
            @edit="editFrutas"
            @remove="removeFruta"
          >
            <template #item-left="{ item }">
              <span class="emoji">{{ item.emoji }}</span>
            </template>
          </CollapsibleList>
          <CollapsibleList
            title="Verduras"
            :items="verduras"
            v-model:collapsed="collapsedVerduras"
            @add="addVerdura"
            @edit="editVerduras"
            @remove="removeVerdura"
          >
            <template #item-left="{ item }">
              <span class="emoji">{{ item.emoji }}</span>
            </template>
          </CollapsibleList>
          <CollapsibleList
            title="Perfumería"
            :items="[]"
            v-model:collapsed="collapsedPerfumeria"
          />
          <CollapsibleList
            title="Conservas"
            :items="[]"
            v-model:collapsed="collapsedConservas"
          />
        </div>
      </section>
    </div>
  </BaseLayout>
</template>

<script setup lang="ts">
import BaseLayout from "@/layouts/BaseLayout.vue";
import CollapsibleList from '@/components/lists/CollapsibleList.vue'
import { ref } from 'vue'

type Item = { id: number; label: string; emoji: string }

type ItemQty = Item & { qty: number }

// Mis Productos
const collapsedFrutas = ref(false)
const collapsedVerduras = ref(false)
const collapsedPerfumeria = ref(true)
const collapsedConservas = ref(true)

const frutas = ref<Item[]>([

  { id: 1, label: 'Manzana', emoji: '🍎' },
  { id: 2, label: 'Banana',  emoji: '🍌' },
  { id: 3, label: 'Naranja', emoji: '🍊' },
  { id: 4, label: 'Pera',    emoji: '🍐' },
])

const verduras = ref<Item[]>([
{ id: 1, label: 'Zanahoria', emoji: '🥕' },
 { id: 2, label: 'Lechuga',   emoji: '🥬' },
 { id: 3, label: 'Tomate',    emoji: '🍅' },
 { id: 4, label: 'Papa',      emoji: '🥔' },
])

const productos = ref<Item[]>([...frutas.value, ...verduras.value ])

function addFruta() {
  const nextId = Math.max(0, ...frutas.value.map(i => i.id)) + 1
  frutas.value.push({ id: nextId, label: 'Nueva fruta', emoji: '🆕' })
}
function editFrutas() { console.log('Editar categoría: Frutas') }
function removeFruta(item: Item) { frutas.value = frutas.value.filter(i => i.id !== item.id) }

function addVerdura() {
  const nextId = Math.max(0, ...verduras.value.map(i => i.id)) + 1
  verduras.value.push({ id: nextId, label: 'Nueva verdura', emoji: '🆕' })
}
function editVerduras() { console.log('Editar categoría: Verduras') }
function removeVerdura(item: Item) { verduras.value = verduras.value.filter(i => i.id !== item.id) }


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
</style>

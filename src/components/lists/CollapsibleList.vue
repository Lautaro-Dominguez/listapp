<template>
  <section class="collapsible-list" :class="{ isCollapsed: localCollapsed }">
    <header class="list-header">
      <div>
        <h3 class="list-title">
          <template v-if="showEditTitle">
            <input v-model="editableTitle" @keyup.enter="confirmEditTitle" @blur="cancelEditTitle" class="edit-title-input" />
          </template>
          <template v-else>
            {{ localTitle }}
          </template>
        </h3>
        <div v-if="date" class="list-date">{{ date }}</div>
      </div>
      <div class="header-actions">
        <!-- botones de la lista: agregar, editar, expandir lista -->
        <slot name="header-actions" :toggle="toggle" :collapsed="localCollapsed" :startEdit="startEditTitle">
          <button class="icon-btn" aria-label="Agregar" @click="$emit('add')">
            <v-icon size="22" icon="mdi-plus" />
          </button>
          <button class="icon-btn" aria-label="Editar" @click="startEditTitle">
            <v-icon size="22" icon="mdi-pencil-outline" />
          </button>
          <button class="icon-btn" :aria-label="localCollapsed ? 'Expandir' : 'Contraer'" @click="toggle">
            <v-icon size="22" :icon="localCollapsed ? 'mdi-chevron-down' : 'mdi-chevron-up'" />
          </button>
        </slot>
      </div>
    </header>

    <v-expand-transition>
      <ul v-show="!localCollapsed" class="items">
        <li v-for="item in items" :key="itemKey(item)" class="item">
          <div class="left">
            <!-- Slot para el emoji del producto -->
            <slot name="item-left" :item="item">
              <img v-if="item.icon" :src="item.icon" alt="" class="emoji" />
            </slot>
          </div>
          <div class="label" @click="$emit('select', item)">
            <!-- Slot para el texto del producto -->
            <slot name="item-label" :item="item">{{ item.label }}</slot>
          </div>
          <div class="right">
            <!-- Slot para acciones a la derecha  -->
            <slot name="item-right" :item="item">
              <button class="icon-btn soft" aria-label="Editar" @click.stop="$emit('edit-item', item)">
                <v-icon size="20" icon="mdi-pencil-outline" />
              </button>
              <button class="icon-btn soft" aria-label="Eliminar" @click.stop="$emit('remove', item)">
                <v-icon size="20" icon="mdi-trash-can-outline" />
              </button>
            </slot>
          </div>
        </li>
        <li v-if="!items || items.length === 0" class="empty">
          <slot name="empty">Sin elementos</slot>
        </li>
      </ul>
    </v-expand-transition>
  </section>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

// Declaración de tipos
export type ListItem = {
  id?: string | number
  label: string
  icon?: string
  [key: string]: unknown
}

// Props del componente
const props = withDefaults(defineProps<{
  title: string
  items?: ListItem[]
  collapsed?: boolean
  itemKeyField?: string
  date?: string // Dejo la fecha opcional para "Mis Listas"
}>(), {
  items: () => [],
  collapsed: false,
  itemKeyField: 'id',
  date: undefined,
})

// Eventos emitidos por el componente
const emit = defineEmits<{
  (e: 'update:collapsed', value: boolean): void
  (e: 'toggle', value: boolean): void
  (e: 'add'): void
  (e: 'edit'): void
  (e: 'select', item: ListItem): void
  (e: 'remove', item: ListItem): void
  (e: 'update:title', value: string): void
  (e: 'edit-item', item: ListItem): void
  (e: 'save-item', item: ListItem): void
}>()

const localCollapsed = ref<boolean>(props.collapsed)
const localTitle = ref(props.title)
const showEditTitle = ref(false)
const editableTitle = ref(props.title)

watch(() => props.collapsed, v => (localCollapsed.value = v))
watch(() => props.title, (val) => {
  localTitle.value = val
  editableTitle.value = val
})

function toggle() {
  const v = !localCollapsed.value
  localCollapsed.value = v
  emit('update:collapsed', v)
  emit('toggle', v)
}

function startEditTitle() {
  showEditTitle.value = true
  editableTitle.value = localTitle.value
  setTimeout(() => {
    const input = document.querySelector('.edit-title-input') as HTMLInputElement
    if (input) input.focus()
  }, 0)
}
function confirmEditTitle() {
  if (editableTitle.value.trim() && editableTitle.value !== localTitle.value) {
    localTitle.value = editableTitle.value.trim()
    emit('update:title', localTitle.value)
  }
  showEditTitle.value = false
}
function cancelEditTitle() {
  showEditTitle.value = false
  editableTitle.value = localTitle.value
}

// Obtiene la clave única de cada producto
function itemKey(item: ListItem) {
  const keyField = props.itemKeyField as keyof ListItem
  return (keyField && (item[keyField] as string | number | undefined)) ?? item.label
}
</script>

<style scoped>
.collapsible-list {
  width: 100%;
  border-radius: 16px;
  margin: 14px 0;
  font-family: 'Crete Round', serif;
}

.list-header {
  background: #cfe8b6;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px 12px 18px;
  border-radius: 16px;
}

.list-title {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: #1f1f1f;
}

.list-date {
  font-size: 16px;
  color: #647060;
  margin-top: 2px;
  font-family: 'Crete Round', serif;
}

.header-actions {
  display: flex;
  gap: 10px;
}

/* se mantiene el mismo estilo de los botones para cada pagina */
:deep(.header-actions .icon-btn) {
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
  box-shadow: inset 0 0 0 2px rgba(0,0,0,0.08);
  font-family: 'Crete Round', serif;
  font-weight: 700;
  transition: background 0.2s, color 0.2s;
}
:deep(.header-actions .icon-btn:hover) { background: #a3c86d; }
:deep(.header-actions .icon-btn:active) { background: #b7d88a; }

.icon-btn.soft {
  background: #fff;
  color: #000;
  font-weight: 700;
  border: 2px solid #c8dcc5;
}
.icon-btn.soft:active { filter: brightness(0.96); }
.icon-btn.soft:disabled { opacity: 0.5; }

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
  box-shadow: inset 0 0 0 2px rgba(0,0,0,0.08);
  font-family: 'Crete Round', serif;
  font-weight: 700;
  transition: background 0.2s, color 0.2s;
}
.icon-btn:hover { filter: brightness(0.96); }
.icon-btn:active { transform: translateY(1px); }

.header-actions .icon-btn {
  background: #9bd166;
  color: #1f1f1f;
  border: none;
}
.header-actions .icon-btn:hover {
  background: #a3c86d;
}
.header-actions .icon-btn:active {
  background: #b7d88a;
}

/* contenedor de items */
.items {
  list-style: none;
  padding: 12px;
  margin: 6px 4px 0 4px;
  background: #c8dcc5;
  border-radius: 14px;
}

/* tarjeta de cada item */
.item {
  display: grid;
  grid-template-columns: 48px 1fr auto;
  align-items: center;
  gap: 10px;
  background: #fbf2ee;
  padding: 10px 12px;
  margin: 8px 8px;
  border-radius: 14px;
  border: 2px solid #c8dcc5;
}

.left { display: flex; align-items: center; justify-content: center; }
.emoji { width: 30px; height: 30px; object-fit: contain; }

.label {
  font-size: 20px;
  color: #000;
  font-family: 'Crete Round', serif;
  font-weight: 700;
}

.right { display: flex; align-items: center; gap: 6px; }

.icon-btn.soft {
  background: #fff;
  color: #000;
  font-weight: 700;
  border: 2px solid #c8dcc5;
}
.icon-btn.soft:active { filter: brightness(0.96); }
.icon-btn.soft:disabled { opacity: 0.5; }

.empty {
  text-align: center;
  color: #647060;
  padding: 10px 0;
  font-style: italic;
}

.edit-title-input {
  font-size: 28px;
  font-weight: 700;
  color: #1f1f1f;
  border: 1.5px solid #a3c86d;
  border-radius: 8px;
  padding: 2px 8px;
  width: 90%;
  font-family: 'Crete Round', serif;
}
</style>

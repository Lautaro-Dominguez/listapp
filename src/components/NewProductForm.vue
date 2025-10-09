<template>
  <div class="modal-bg">
    <div class="modal">
      <h3>Nuevo producto</h3>
      <label>Nombre:<input v-model="localName" placeholder="Nombre del producto" /></label>
      <label>Emoji:
        <select v-model="localEmoji" class="emoji-select">
          <option value="" disabled>Elige un emoji</option>
          <option v-for="emoji in emojiList" :key="emoji" :value="emoji">{{ emoji }} {{ emojiLabel[emoji] }}</option>
        </select>
      </label>
      <div class="modal-actions">
        <button @click="onAdd">Agregar</button>
        <button @click="$emit('cancel')">Cancelar</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, defineProps, defineEmits } from 'vue'

const props = defineProps({
  name: { type: String, default: '' },
  emoji: { type: String, default: '' },
})
const emit = defineEmits(['add', 'cancel'])

const localName = ref(props.name)
const localEmoji = ref(props.emoji)

const emojiList = [
  '🍎', // Manzana
  '🍌', // Banana
  '🍊', // Naranja
  '🍐', // Pera
  '🥕', // Zanahoria
  '🥬', // Lechuga
  '🍅', // Tomate
  '🥔', // Papa
  '🧴', // Perfumería
  '🥫', // Conservas
  '🍞', // Pan
  '🥛', // Leche
  '🍗', // Pollo
  '🍫', // Chocolate
  '🍪', // Galletita
  '🧀', // Queso
  '🍕', // Pizza
  '🍔', // Hamburguesa
  '🍟', // Papas fritas
  '🍣', // Sushi
  '🍰', // Torta
  '🍦', // Helado
  '🍿', // Pochoclo
  '🧃', // Jugo
  '🧻', // Papel
  '🧼', // Jabón
  '🧽', // Esponja
  '🧊', // Hielo
  '🧂', // Sal
  '🧋', // Té/Bebida
  '🆕'  // Otro
]
const emojiLabel: Record<string, string> = {
  '🍎': 'Manzana', '🍌': 'Banana', '🍊': 'Naranja', '🍐': 'Pera',
  '🥕': 'Zanahoria', '🥬': 'Lechuga', '🍅': 'Tomate', '🥔': 'Papa',
  '🧴': 'Perfumería', '🥫': 'Conservas', '🍞': 'Pan', '🥛': 'Leche',
  '🍗': 'Pollo', '🍫': 'Chocolate', '🍪': 'Galletita', '🧀': 'Queso',
  '🍕': 'Pizza', '🍔': 'Hamburguesa', '🍟': 'Papas fritas', '🍣': 'Sushi',
  '🍰': 'Torta', '🍦': 'Helado', '🍿': 'Pochoclo', '🧃': 'Jugo',
  '🧻': 'Papel', '🧼': 'Jabón', '🧽': 'Esponja', '🧊': 'Hielo',
  '🧂': 'Sal', '🧋': 'Té/Bebida', '🆕': 'Otro'
}

watch(() => props.name, (val) => { localName.value = val })
watch(() => props.emoji, (val) => { localEmoji.value = val })

function onAdd() {
  if (!localName.value.trim()) return
  emit('add', { name: localName.value.trim(), emoji: localEmoji.value.trim() })
  localName.value = ''
  localEmoji.value = ''
}
</script>

<style scoped>
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
.emoji-select {
  font-size: 18px;
  padding: 4px 8px;
  border-radius: 6px;
  border: 1.5px solid #bbb;
  background: #fff;
  margin-top: 6px;
  width: 100%;
  cursor: pointer;
}
.emoji-select:focus {
  border: 1.5px solid #888;
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
</style>

<template>
  <div class="modal-bg">
    <div class="modal">
      <h3>Nueva lista</h3>
      <label>
        Nombre:
        <input 
          v-model="localName" 
          placeholder="Nombre de la lista"
          @keyup.enter="onAdd"
        />
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
  name: { type: String, default: '' }
})
const emit = defineEmits(['submit', 'cancel'])

const localName = ref(props.name)

watch(() => props.name, (val) => { localName.value = val })

function onAdd() {
  if (!localName.value.trim()) return
  emit('submit', { 
    name: localName.value.trim(),
    description: '', // Siempre enviamos una descripción vacía
    recurring: false,
    metadata: {}
  })
  localName.value = ''
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

<template>
  <div class="modal-bg">
    <div class="modal">
      <h3>Editar perfil</h3>
      <label>
        Nombre:
        <input v-model="localName" placeholder="Nombre" />
      </label>
      <label>
        Apellido:
        <input v-model="localSurname" placeholder="Apellido" />
      </label>
      <label>
        Apodo:
        <input v-model="localNickname" placeholder="Apodo" />
      </label>
      <div class="modal-actions">
        <button @click="onSave" :disabled="isLoading">
          {{ isLoading ? 'Guardando...' : 'Cambiar datos' }}
        </button>
        <button @click="$emit('cancel')" :disabled="isLoading">Cancelar</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, defineProps, defineEmits, onMounted } from 'vue'

const props = defineProps({
  name: { type: String, default: '' },
  surname: { type: String, default: '' },
  nickname: { type: String, default: '' },
})

const emit = defineEmits(['save', 'cancel'])

const localName = ref('')
const localSurname = ref('')
const localNickname = ref('')
const isLoading = ref(false)

onMounted(() => {
  localName.value = props.name
  localSurname.value = props.surname
  localNickname.value = props.nickname
})

watch(() => props.name, (val) => { localName.value = val })
watch(() => props.surname, (val) => { localSurname.value = val })
watch(() => props.nickname, (val) => { localNickname.value = val })

function onSave() {
  if (!localName.value.trim() || !localSurname.value.trim()) {
    alert('Nombre y apellido son requeridos')
    return
  }
  
  isLoading.value = true
  
  emit('save', {
    name: localName.value.trim(),
    surname: localSurname.value.trim(),
    nickname: localNickname.value.trim()
  })
}

defineExpose({
  resetLoading: () => {
    isLoading.value = false
  }
})
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
  min-width: 300px;
  box-shadow: 0 2px 16px rgba(0,0,0,0.18);
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
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid #bbb;
  color: #222;
  background: #fff;
}

.modal input:focus {
  outline: none;
  border-color: #8CC94F;
}

.modal-actions { 
  display: flex; 
  gap: 12px; 
  justify-content: flex-end; 
  margin-top: 8px; 
}

.modal-actions button {
  padding: 8px 16px;
  border-radius: 8px;
  border: none;
  background: #eee;
  color: #222;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.modal-actions button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.modal-actions button:first-child {
  background: #8CC94F;
  color: #666666;
}

.modal-actions button:first-child:hover:not(:disabled) {
  background: #7AB83D;
}

.modal-actions button:last-child:hover:not(:disabled) {
  background: #ddd;
}
</style>
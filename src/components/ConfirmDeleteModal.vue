<template>
  <div class="modal-bg" @click="$emit('cancel')">
    <div class="modal modal-delete" @click.stop>
      <div class="modal-icon-warning">⚠️</div>
      <h3>{{ title }}</h3>
      <p class="modal-message">
        <slot name="message" />
      </p>
      <p v-if="submessage" class="modal-submessage">
        {{ submessage }}
      </p>
      <div class="modal-actions">
        <button @click="$emit('confirm')" class="btn-delete">{{ confirmText || 'Eliminar' }}</button>
        <button @click="$emit('cancel')" class="btn-cancel">{{ cancelText || 'Cancelar' }}</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string
  submessage?: string
  confirmText?: string
  cancelText?: string
}

const props = defineProps<Props>()
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
  min-width: 260px;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.18);
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
.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 8px;
}
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
.modal-delete {
  text-align: center;
  max-width: 450px;
}
.modal-icon-warning {
  font-size: 48px;
  margin-bottom: 12px;
}
.modal-message {
  font-size: 16px;
  color: #333;
  margin: 12px 0;
  line-height: 1.5;
}
.modal-message strong {
  color: #000;
  font-weight: 600;
}
.modal-submessage {
  font-size: 14px;
  color: #666;
  margin: 8px 0 16px;
  line-height: 1.4;
}
.btn-delete {
  background: #e74c3c !important;
  color: #fff !important;
}
.btn-delete:hover {
  background: #c0392b !important;
}
.btn-cancel {
  background: #eee !important;
  color: #222 !important;
}
.btn-cancel:hover {
  background: #ddd !important;
}
</style>


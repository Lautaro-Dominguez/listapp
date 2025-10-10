<template>
  <div class="qty-actions">
    <button class="icon-btn soft" aria-label="Restar" @click.stop="onDec(item)">
      <v-icon size="18" icon="mdi-minus" color="black" />
    </button>
    <span class="qty">{{ item.qty }}</span>
    <button class="icon-btn soft" aria-label="Sumar" @click.stop="onInc(item)">
      <v-icon size="18" icon="mdi-plus" color="black" />
    </button>
    <button class="icon-btn soft" aria-label="Eliminar" @click.stop="onRemove(item)">
      <v-icon size="18" icon="mdi-trash-can-outline" color="black" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'

defineProps<{
  item: { id: number; label: string; qty: number }
  onInc: (item: any) => void
  onDec: (item: any) => void
  onRemove: (item: any) => void
}>()
</script>

<style scoped>
.qty-actions { display: inline-flex; align-items: center; gap: 8px; }
.qty { min-width: 28px; text-align: center; font-weight: 700; color: #000; }
</style>


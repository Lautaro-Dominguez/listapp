<template>
  <div class="searchbar" :class="{ focused: isFocused }">
    <v-icon class="icon-left" icon="mdi-magnify" size="22" />
    <input
      ref="inputEl"
      class="search-input"
      :placeholder="placeholder"
      :value="localValue"
      @input="onInput"
      @focus="isFocused = true"
      @blur="isFocused = false"
      @keyup.enter="onEnter"
    />
    <button v-if="localValue" class="clear-btn" @click="clear" aria-label="Limpiar búsqueda">
      <v-icon icon="mdi-close" size="18" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'

const props = withDefaults(defineProps<{
  modelValue?: string
  placeholder?: string
  debounce?: number
  autofocus?: boolean
}>(), {
  modelValue: '',
  placeholder: 'Buscar…',
  debounce: 200,
  autofocus: false,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'enter', value: string): void
  (e: 'clear'): void
}>()

const isFocused = ref(false)
const localValue = ref(props.modelValue || '')
const inputEl = ref<HTMLInputElement | null>(null)
let debounceTimer: any = null

watch(() => props.modelValue, (v) => {
  if (v !== localValue.value) localValue.value = v || ''
})

onMounted(() => {
  if (props.autofocus && inputEl.value) inputEl.value.focus()
})

function emitChange(val: string) {
  emit('update:modelValue', val)
}

function onInput(e: Event) {
  const val = (e.target as HTMLInputElement).value
  localValue.value = val
  if (props.debounce && props.debounce > 0) {
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => emitChange(val), props.debounce)
  } else {
    emitChange(val)
  }
}

function onEnter() {
  emit('enter', localValue.value)
}

function clear() {
  localValue.value = ''
  emit('update:modelValue', '')
  emit('clear')
  if (inputEl.value) inputEl.value.focus()
}
</script>

<style scoped>
.searchbar {
  display: grid;
  grid-template-columns: 28px 1fr 28px;
  align-items: center;
  gap: 6px;
  background: #fff;
  border: 2px solid #c8dcc5;
  border-radius: 999px;
  padding: 8px 10px 8px 8px;
  box-shadow: 0 1px 0 rgba(0,0,0,0.04);
}
.searchbar.focused {
  border-color: #a3c86d;
}
.icon-left { color: #647060; }
.search-input {
  width: 100%;
  border: none;
  outline: none;
  font-size: 16px;
  background: transparent;
  color: #1f1f1f;
}
.clear-btn {
  width: 26px;
  height: 26px;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: #647060;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.clear-btn:hover { background: rgba(0,0,0,0.06); }
</style>


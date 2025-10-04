/// <reference types="vite/client" />

// declaración de tipo para BaseLayout.vue
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, any>
  export default component
}

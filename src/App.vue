<template>
  <v-app>
    <v-main>
      <BaseLayout>
        <RouterView />
      </BaseLayout>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import BaseLayout from '@/layouts/BaseLayout.vue'
</script>

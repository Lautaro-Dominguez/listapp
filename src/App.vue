<template>
  <v-app>
    <v-main>
      <BaseLayout>
        <DemoCollapsible />
      </BaseLayout>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import BaseLayout from '@/layouts/BaseLayout.vue'
import DemoCollapsible from '@/pages/DemoCollapsible.vue'
</script>

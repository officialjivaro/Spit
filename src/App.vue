<script setup>
import { RouterView } from 'vue-router'
import AppShell from './components/layout/AppShell.vue'
</script>

<template>
  <!-- App Root | Keeps shared layout around every route -->
  <AppShell>
    <RouterView />
  </AppShell>
</template>

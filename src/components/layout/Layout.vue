<template>
  <div class="app-container">
    <AppHeader :exportPanelRef="exportPanelRef" />
    <main class="app-main">
      <div class="app-content">
        <router-view></router-view>
      </div>
      <ExportPanel 
        ref="exportPanelRef" 
        :isDialogVisible="isDialogVisible" 
        @update:isDialogVisible="isDialogVisible = $event" 
      />
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import AppHeader from './AppHeader.vue'
import ExportPanel from '@/components/ExportPanel.vue'

const isDialogVisible = ref(false)
const exportPanelRef = ref(null)
</script>

<style scoped>
.app-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-main {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.app-content {
  flex: 1;
  overflow-y: auto;
}
</style> 
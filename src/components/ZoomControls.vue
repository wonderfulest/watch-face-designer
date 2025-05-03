<template>
  <div class="zoom-controls">
    <el-button circle @click="handleZoomOut" title="缩小">
      <el-icon>
        <Minus />
      </el-icon>
    </el-button>
    <span class="zoom-level">{{ Math.round(zoomLevel * 100) }}%</span>
    <el-button circle @click="handleZoomIn" title="放大">
      <el-icon>
        <Plus />
      </el-icon>
    </el-button>
    <el-button circle @click="handleResetZoom" title="重置缩放">
      <el-icon>
        <Refresh />
      </el-icon>
    </el-button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Minus, Plus, Refresh } from '@element-plus/icons-vue'
import { useBaseStore } from '@/stores/baseStore'

const baseStore = useBaseStore()
const zoomLevel = ref(1)

const handleZoomIn = () => {
  if (zoomLevel.value < 2) {
    zoomLevel.value += 0.1
    baseStore.canvas?.setZoom(zoomLevel.value)
  }
}

const handleZoomOut = () => {
  if (zoomLevel.value > 0.5) {
    zoomLevel.value -= 0.1
    baseStore.canvas?.setZoom(zoomLevel.value)
  }
}

const handleResetZoom = () => {
  zoomLevel.value = 1
  baseStore.canvas?.setZoom(1)
}
</script>

<style scoped>
.zoom-controls {
  display: flex;
  align-items: center;
  gap: 2px;
  border-radius: 4px;
}

.zoom-level {
  font-size: 14px;
  color: #666;
  min-width: 50px;
  text-align: center;
}

:deep(.el-button) {
  padding: 6px;
  border: 1px solid #dcdfe6;
  background-color: #fff;
}

:deep(.el-button:hover) {
  color: #409eff;
  border-color: #c6e2ff;
  background-color: #ecf5ff;
}

:deep(.el-icon) {
  font-size: 16px;
}
</style> 
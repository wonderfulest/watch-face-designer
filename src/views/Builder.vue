<template>
  <div class="builder">
    <div class="builder-header">
      <h2>表盘设计器</h2>
      <ZoomControls :canvas-ref="canvasRef" />
    </div>
    <div class="builder-content">
      <div class="builder-left">
        <ElementList />
      </div>
      <div class="builder-center">
        <Canvas ref="canvasRef" />
      </div>
      <div class="builder-right">
        <ElementSettings />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ElementList from '@/components/ElementList.vue'
import ElementSettings from '@/components/ElementSettings.vue'
import Canvas from '@/views/Canvas.vue'
import ZoomControls from '@/components/ZoomControls.vue'

const canvasRef = ref(null)
</script> 
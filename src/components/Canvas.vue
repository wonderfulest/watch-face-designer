<template>
  <div class="canvas-wrapper">
    <canvas ref="canvasRef"></canvas>
  </div>
</template>

<script setup>
import { onMounted, ref, onUnmounted, computed, watch } from 'vue'
import { Canvas, FabricText, Circle, FabricObject, Line } from 'fabric'
import emitter from '@/utils/eventBus'
import { useBaseStore } from '@/stores/baseStore'
import { useLayerStore } from '@/stores/layerStore'
import { initAligningGuidelines } from '@/lib/aligning_guidelines'
import { initCenteringGuidelines } from '@/lib/centering_guidelines'
import { throttle } from '@/utils/performance'

const canvasRef = ref(null)
const baseStore = useBaseStore()
const layerStore = useLayerStore()
let updateInterval
const WATCH_SIZE = computed(() => baseStore.WATCH_SIZE)

FabricObject.customProperties = ['id', 'eleType', 'metricSymbol', 'metricGroup']

// 绘制水平标尺
const drawHorizontalRuler = (ctx, width, zoom) => {
  ctx.clearRect(0, 0, width, 40)
  ctx.fillStyle = '#f0f0f0'
  ctx.fillRect(0, 0, width, 40)
  ctx.strokeStyle = '#999'
  ctx.beginPath()
  for (let i = 0; i < width; i += 10 * zoom) {
    ctx.moveTo(i, 40)
    ctx.lineTo(i, i % (50 * zoom) === 0 ? 15 : 30)
    if (i % (50 * zoom) === 0) {
      ctx.fillStyle = '#333'
      ctx.fillText(Math.round(i / zoom), i + 2, 10)
    }
  }
  ctx.stroke()
}

// 绘制垂直标尺
const drawVerticalRuler = (ctx, height, zoom) => {
  ctx.clearRect(0, 0, 40, height)
  ctx.fillStyle = '#f0f0f0'
  ctx.fillRect(0, 0, 40, height)
  ctx.strokeStyle = '#999'
  ctx.beginPath()
  for (let i = 0; i < height; i += 10 * zoom) {
    ctx.moveTo(40, i)
    ctx.lineTo(i % (50 * zoom) === 0 ? 15 : 30, i)
    if (i % (50 * zoom) === 0) {
      ctx.fillStyle = '#333'
      ctx.save()
      ctx.translate(10, i + 2)
      ctx.rotate(-Math.PI / 2)
      ctx.fillText(Math.round(i / zoom), 0, 0)
      ctx.restore()
    }
  }
  ctx.stroke()
}

// 更新标尺
const updateRulers = () => {
  const horizontalRuler = document.querySelector('.ruler-horizontal')
  const verticalRuler = document.querySelector('.ruler-vertical')
  if (!horizontalRuler || !verticalRuler || !baseStore.canvas) return
  
  const horizontalCtx = horizontalRuler.getContext('2d')
  const verticalCtx = verticalRuler.getContext('2d')
  const zoom = baseStore.canvas.getZoom()
  
  drawHorizontalRuler(horizontalCtx, WATCH_SIZE.value, zoom)
  drawVerticalRuler(verticalCtx, WATCH_SIZE.value, zoom)
}

// 添加辅助线
const addGuideLine = (canvas, orientation, position) => {
  const line = new Line(
    orientation === 'horizontal' 
      ? [0, position, canvas.width, position] 
      : [position, 0, position, canvas.height],
    {
      stroke: 'rgba(0,0,255,0.5)',
      selectable: false,
      evented: false,
      strokeDashArray: [5, 5],
      name: 'guideLine'
    }
  )
  canvas.add(line)
  canvas.requestRenderAll()
}

// Canvas.vue
const refreshCanvas = throttle((event) => {
  emitter.emit('refresh-canvas', { event })
  updateRulers()
}, 16) // 约60fps

onMounted(() => {
  // 创建画布，尺寸比手表大一些以显示边界
  const canvas = new Canvas(canvasRef.value, {
    width: WATCH_SIZE.value,
    height: WATCH_SIZE.value,
    radius: WATCH_SIZE.value / 2,
    backgroundColor: baseStore.backgroundColor
  })

  // 添加 passive 事件监听器
  canvas.wrapperEl.addEventListener('wheel', () => {}, { passive: true })

  // 对象间对齐辅助线
  initAligningGuidelines(canvas)
  initCenteringGuidelines(canvas)
  // 可以多选
  canvas.selection = true

  // 合并相似事件
  canvas.on({
    'object:moving object:modified object:moved': refreshCanvas,
    'selection:created selection:updated selection:cleared': refreshCanvas,
    deselected: refreshCanvas,
    'mouse:up': refreshCanvas,
    'mouse:down': refreshCanvas
  })

  // 添加辅助线
  canvas.on('mouse:down', function (opt) {
    if (opt.e.shiftKey) {
      const pointer = canvas.getPointer(opt.e)
      addGuideLine(canvas, 'horizontal', pointer.y)
    } else if (opt.e.ctrlKey) {
      const pointer = canvas.getPointer(opt.e)
      addGuideLine(canvas, 'vertical', pointer.x)
    }
  })

  baseStore.setCanvas(canvas)
  updateRulers()
})

onUnmounted(() => {
  if (updateInterval) {
    clearInterval(updateInterval)
  }
})

// 监听画布大小变化
watch(WATCH_SIZE, () => {
  updateRulers()
})
</script>

<style scoped>
.canvas-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.zoom-controls {
  position: absolute;
  top: 20px;
  right: 20px;
  background: white;
  padding: 8px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  gap: 8px;
  align-items: center;
  z-index: 2;
}

.zoom-controls button {
  width: 24px;
  height: 24px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.zoom-controls button:hover {
  background: #f5f5f5;
}

.canvas-container {
  width: 600px;
  height: 600px;
  background: white;
  border-radius: 4px;
}
</style>

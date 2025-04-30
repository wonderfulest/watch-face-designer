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
const drawHorizontalRuler = (ctx, width, zoom, canvasLeft) => {
  console.log('绘制水平标尺:', { width, zoom, canvasLeft })
  
  ctx.clearRect(0, 0, width, 40)
  ctx.fillStyle = '#f0f0f0'
  ctx.fillRect(0, 0, width, 40)
  ctx.strokeStyle = '#999'
  ctx.beginPath()
  
  // 计算起始位置，使手表表盘左上角为(0,0)点
  const rulerOffset = 40 // 标尺的宽度
  const startX = -canvasLeft
  const endX = startX + WATCH_SIZE.value + rulerOffset
  
  // 绘制刻度线
  for (let i = Math.floor(startX / 10) * 10; i <= 800; i += 10) {
    const x = (i + canvasLeft) * zoom
    
    // 大刻度（100像素）
    if (i % 100 === 0) {
      ctx.moveTo(x, 40)
      ctx.lineTo(x, 20)
      // 添加数字标签
      ctx.fillStyle = '#333'
      ctx.font = '12px Arial'
      ctx.fillText(i, x + 2, 15)
      console.log('绘制大刻度:', { position: x, value: i })
    } 
    // 小刻度（10像素）
    else {
      ctx.moveTo(x, 40)
      ctx.lineTo(x, 30)
    }
  }
  ctx.stroke()
}

// 绘制垂直标尺
const drawVerticalRuler = (ctx, height, zoom, canvasTop) => {
  console.log('绘制垂直标尺:', { height, zoom, canvasTop })
  
  ctx.clearRect(0, 0, 40, height)
  ctx.fillStyle = '#f0f0f0'
  ctx.fillRect(0, 0, 40, height)
  ctx.strokeStyle = '#999'
  ctx.beginPath()
  
  // 计算起始位置，使手表表盘左上角为(0,0)点
  const rulerOffset = 40 // 标尺的高度
  const startY = -canvasTop
  const endY = startY + WATCH_SIZE.value + rulerOffset
  
  // 绘制刻度线
  for (let i = Math.floor(startY / 10) * 10; i <= 800; i += 10) {
    const y = (i + canvasTop) * zoom
    
    // 大刻度（100像素）
    if (i % 100 === 0) {
      ctx.moveTo(40, y)
      ctx.lineTo(20, y)
      // 添加数字标签
      ctx.fillStyle = '#333'
      ctx.font = '12px Arial'
      ctx.save()
      ctx.translate(15, y + 2)
      ctx.rotate(-Math.PI / 2)
      ctx.fillText(i, 0, 0)
      ctx.restore()
      console.log('绘制大刻度:', { position: y, value: i })
    } 
    // 小刻度（10像素）
    else {
      ctx.moveTo(40, y)
      ctx.lineTo(30, y)
    }
  }
  ctx.stroke()
}

// 更新标尺
const updateRulers = () => {
  const horizontalRuler = document.querySelector('.ruler-horizontal')
  const verticalRuler = document.querySelector('.ruler-vertical')
  const centerArea = document.querySelector('.center-area')
  const canvasContainer = document.querySelector('.canvas-container')
  
  if (!horizontalRuler || !verticalRuler || !baseStore.canvas || !centerArea || !canvasContainer) {
    console.log('标尺元素未找到:', {
      horizontalRuler: !!horizontalRuler,
      verticalRuler: !!verticalRuler,
      canvas: !!baseStore.canvas,
      centerArea: !!centerArea,
      canvasContainer: !!canvasContainer
    })
    return
  }

  try {
    const horizontalCtx = horizontalRuler.getContext('2d')
    const verticalCtx = verticalRuler.getContext('2d')
    
    if (!horizontalCtx || !verticalCtx) {
      console.error('无法获取标尺上下文')
      return
    }

    const zoom = baseStore.canvas.getZoom()
    
    // 获取表盘容器的位置
    const containerRect = canvasContainer.getBoundingClientRect()
    const centerRect = centerArea.getBoundingClientRect()
    
    // 计算表盘左上角相对于标尺的偏移量
    const canvasLeft = containerRect.left - centerRect.left - 40 // 减去垂直标尺宽度
    const canvasTop = containerRect.top - centerRect.top - 40 // 减去水平标尺高度
    
    console.log('更新标尺:', {
      containerRect,
      centerRect,
      canvasLeft,
      canvasTop,
      watchSize: WATCH_SIZE.value,
      zoom
    })
    
    // 设置画布尺寸
    horizontalRuler.width = centerArea.clientWidth - 40 // 减去标尺的宽度
    horizontalRuler.height = 40
    verticalRuler.width = 40
    verticalRuler.height = centerArea.clientHeight - 40 // 减去标尺的高度
    
    drawHorizontalRuler(horizontalCtx, horizontalRuler.width, zoom, canvasLeft)
    drawVerticalRuler(verticalCtx, verticalRuler.height, zoom, canvasTop)
  } catch (error) {
    console.error('更新标尺时出错:', error)
  }
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

  // 监听窗口大小变化
  window.addEventListener('resize', updateRulers)
  
  // 监听滚动事件
  const centerArea = document.querySelector('.center-area')
  if (centerArea) {
    centerArea.addEventListener('scroll', updateRulers)
  }
})

onUnmounted(() => {
  if (updateInterval) {
    clearInterval(updateInterval)
  }

  // 移除事件监听
  window.removeEventListener('resize', updateRulers)
  
  const centerArea = document.querySelector('.center-area')
  if (centerArea) {
    centerArea.removeEventListener('scroll', updateRulers)
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

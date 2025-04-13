<template>
  <div class="layer-panel">
    <div class="layer-list">
      <h2 class="section-title">图层</h2>
      <draggable :list="elements" class="layers-list" :animation="150" @end="handleDragEnd" item-key="id" handle=".layer-content">
        <template #item="{ element: layer }">
          <div
            :class="{
              'layer-selected': isActived(layer.id),
              'layer-locked': layer.locked
            }"
            :style="getLayerBackgroundColor(layer)"
            @click="selectLayer(layer)">
            <div v-if="layer.eleType" class="layer-item">
              <div class="layer-content">
                <span class="layer-icon">
                  <Icon :icon="getElementIcon(layer.eleType)" />
                </span>
                <span class="layer-name">{{ layer.eleType }}</span>
              </div>
              <div class="layer-actions">
                <button class="layer-btn" @click.stop="toggleVisibility(layer)">
                  <Icon :icon="layer.visible ? 'material-symbols:visibility' : 'material-symbols:visibility-off'" />
                </button>
                <button class="layer-btn" @click.stop="toggleLock(layer)">
                  <Icon :icon="layer.locked ? 'material-symbols:lock' : 'material-symbols:lock-open'" />
                </button>
                <button class="layer-btn" @click.stop="deleteLayer(layer)">
                  <Icon icon="material-symbols:delete" />
                </button>
              </div>
            </div>
          </div>
        </template>
      </draggable>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { debounce } from 'lodash-es'
import emitter from '@/utils/eventBus'
import { useLayerStore } from '@/stores/layerStore'
import { useBaseStore } from '@/stores/baseStore'
import { elementConfigs } from '@/config/elements'
import draggable from 'vuedraggable'

const layerStore = useLayerStore()
const baseStore = useBaseStore()

// 对元素进行排序
const elements = ref([])
const sortedElements = ref([])
const activeElements = ref([])

/**
 * 对元素进行排序：
 * 1. 按metricSymbol分组，同一组元素必须相邻
 * 2. 按照坐标从上到下，从左到右排序
 * 3. 分组的数据根据data的坐标进行比较
 * 4. 同步排序后的顺序到canvas._objects
 */
const sortElements = () => {
  if (!elements.value) return

  // 按metricSymbol分组
  const groups = {}
  const nonMetricElements = []

  elements.value.forEach((element) => {
    if (element.metricSymbol) {
      const key = element.metricGroup || element.metricSymbol
      if (!groups[key]) {
        groups[key] = []
      }
      groups[key].push(element)
    } else {
      nonMetricElements.push(element)
    }
  })

  // 对每个组内的元素按类型排序（data元素放在最后）
  Object.values(groups).forEach((group) => {
    group.sort((a, b) => {
      if (a.eleType === 'data') return 1
      if (b.eleType === 'data') return -1
      return 0
    })
  })

  // 获取组的坐标（使用data元素的坐标）
  const getGroupCoords = (group) => {
    const dataElement = group.find((e) => e.eleType === 'data') || group[0]
    return {
      top: parseFloat(dataElement.top) || 0,
      left: parseFloat(dataElement.left) || 0
    }
  }

  // 坐标排序函数
  const compareCoords = (a, b) => {
    const aTop = parseFloat(a.top) || 0
    const bTop = parseFloat(b.top) || 0
    const aLeft = parseFloat(a.left) || 0
    const bLeft = parseFloat(b.left) || 0

    // 首先按top坐标排序
    if (Math.abs(aTop - bTop) > 1) {
      // 使用1像素的阈值来判断是否在同一行
      return aTop - bTop
    }
    // 如果top坐标相近，则按left坐标排序
    return aLeft - bLeft
  }

  // 对非分组元素按坐标排序
  nonMetricElements.sort(compareCoords)

  // 对分组按data元素坐标排序
  const sortedGroups = Object.entries(groups)
    .sort(([keyA, groupA], [keyB, groupB]) => {
      const coordsA = getGroupCoords(groupA)
      const coordsB = getGroupCoords(groupB)

      // 首先按top坐标排序
      if (Math.abs(coordsA.top - coordsB.top) > 1) {
        return coordsA.top - coordsB.top
      }
      // 如果top坐标相近，则按left坐标排序
      return coordsA.left - coordsB.left
    })
    .map(([_, group]) => group)
    .flat()

  // 合并所有元素
  sortedElements.value = [...nonMetricElements, ...sortedGroups]

  // 同步排序后的顺序到canvas._objects
  const canvas = baseStore.canvas
  if (canvas && canvas._objects) {
    // 清空当前的objects数组
    canvas._objects.length = 0
    // 按照新的顺序添加对象
    sortedElements.value.forEach((element) => {
      canvas._objects.push(element)
    })
    // 触发canvas重绘
    canvas.renderAll()
  }
}

// 批量更新
const batchUpdate = () => {
  if (!baseStore.canvas) return
  requestAnimationFrame(() => {
    elements.value = baseStore.canvas.getObjects()
    activeElements.value = baseStore.canvas.getActiveObjects()
    baseStore.canvas.renderAll()
  })
}

// 优化后的更新元素函数
const updateElements = () => {
  batchUpdate()
}

// 使用更短的延迟时间
const debouncedUpdateElements = debounce(updateElements, 100)

// 监听元素属性变化
const setupElementListeners = () => {
  elements.value.forEach((element) => {
    element.on('modified', (e) => {
      if (e.transform) return // 忽略位置和大小的修改
      if (e.target.metricSymbol !== e.target._previousState?.metricSymbol || e.target.metricGroup !== e.target._previousState?.metricGroup) {
        // 保存当前状态用于下次比较
        e.target._previousState = {
          metricSymbol: e.target.metricSymbol,
          metricGroup: e.target.metricGroup
        }

        // 使用 requestAnimationFrame 批量处理画布更新
        requestAnimationFrame(() => {
          sortedElements.value.forEach((element, index) => {
            baseStore.canvas.moveObjectTo(element, index)
          })
          baseStore.canvas.renderAll()
        })
      }
    })
  })
}

onMounted(() => {
  debouncedUpdateElements()
  emitter.on('refresh-canvas', (data) => {
    debouncedUpdateElements()
  })
  window.addEventListener('keydown', handleKeyDown)
  setupElementListeners() // 设置元素监听器
})

const selectLayer = (layer) => {
  baseStore.canvas.discardActiveObject()
  if (layer.eleType === 'global') {
    // 打开全局配置
  } else if (baseStore.canvas && layer) {
    baseStore.canvas.setActiveObject(layer)
  }
  baseStore.canvas.renderAll()
  // 更新
  debouncedUpdateElements()
}

const isActived = (layerId) => {
  // 如果是 global 元素，永远不显示为选中状态
  const layer = elements.value.find((el) => el.id === layerId)
  if (layer && layer.type === 'global') return false

  // 检查是否在活动元素中
  for (const element of activeElements.value) {
    if (element.id == layerId) {
      return true
    }
  }
  return false
}

const toggleVisibility = (layer) => {
  layerStore.toggleLayerVisibility(layer.id)
  if (baseStore.canvas) {
    baseStore.canvas.renderAll()
  }
}

const toggleLock = (layer) => {
  layerStore.toggleLayerLock(layer.id)
}

// 处理拖拽结束事件
const handleDragEnd = () => {
  // 更新画布中元素的顺序
  sortedElements.value.forEach((element, index) => {
    baseStore.canvas.moveObjectTo(element, index)
  })
  baseStore.canvas.renderAll()
}

// 历史记录管理
const history = ref([])
const currentHistoryIndex = ref(-1)

// 添加操作到历史记录
const addToHistory = (action) => {
  // 如果当前不在历史记录末尾，清除后面的记录
  if (currentHistoryIndex.value < history.value.length - 1) {
    history.value = history.value.slice(0, currentHistoryIndex.value + 1)
  }

  history.value.push(action)
  currentHistoryIndex.value = history.value.length - 1
}

// 撤销操作
const undo = () => {
  if (currentHistoryIndex.value >= 0) {
    const action = history.value[currentHistoryIndex.value]
    if (action.type === 'delete') {
      // 恢复删除的元素
      baseStore.canvas.add(action.element)
      layerStore.addLayer(action.element)
    }
    currentHistoryIndex.value--
    baseStore.canvas.renderAll()
  }
}

const deleteLayer = (layer) => {
  if (layer.locked) return
  if (baseStore.canvas) {
    // 保存删除操作到历史记录
    addToHistory({
      type: 'delete',
      element: layer
    })

    baseStore.canvas.remove(layer)
    layerStore.removeLayer(layer.id)
    updateElements() // 删除后重新排序
    baseStore.canvas.discardActiveObject()
  }
}

const handleKeyDown = (event) => {
  // 检查当前焦点元素
  const activeElement = document.activeElement
  const isInputActive = activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA' || activeElement.isContentEditable

  // 如果当前在输入框中，不处理删除快捷键
  if (isInputActive) {
    return
  }

  // 删除快捷键
  if (event.key === 'Delete' || event.key === 'Backspace') {
    const activeObject = baseStore.canvas.getActiveObject()
    if (activeObject) {
      deleteLayer(activeObject)
    }
  }

  // 撤销快捷键 (Command + Z)
  if (event.key === 'z' && (event.metaKey || event.ctrlKey)) {
    event.preventDefault() // 阻止浏览器默认的撤销行为
    undo()
  }
}

const getElementIcon = (eleType) => {
  for (const category of Object.values(elementConfigs)) {
    if (category[eleType]) {
      return category[eleType].icon
    }
  }
  return 'material-symbols:circle'
}

const getLayerBackgroundColor = (layer) => {
  if ((layer.eleType === 'icon' || layer.eleType === 'data' || layer.eleType === 'label' || layer.eleType === 'progressRing') && layer.metricGroup) {
    const id = layer.metricGroup
    const color = generateColorFromId(id)
    return { backgroundColor: color }
  }
  return {}
}

const generateColorFromId = (id) => {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash)
  }
  const color = `hsl(${hash % 360}, 70%, 80%)` // HSL color
  return color
}

onUnmounted(() => {
  emitter.off('refresh-canvas')
  window.removeEventListener('keydown', handleKeyDown)
})
</script>

<style scoped>
.layer-panel {
  height: 100%;
  overflow: auto;
}

.layer-list {
  padding: 16px;
}

.section-title {
  margin: 0 0 16px;
  color: #333;
  padding-bottom: 8px;
  border-bottom: 1px solid #eee;
}

.layers-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.layer-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px;
  border: 1px solid #eee;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.layer-item:hover {
  background: #f5f5f5;
}

.layer-selected {
  border: 4px solid #1890ff;
  background: #e6f7ff;
}

.layer-content {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: move; /* 指示可拖动 */
}

.layer-icon {
  font-size: 20px;
  display: flex;
  align-items: center;
}

.layer-name {
  font-size: 14px;
  color: #333;
}

.layer-actions {
  display: flex;
  gap: 4px;
}

.layer-btn {
  padding: 4px;
  font-size: 20px;
  border: none;
  background: none;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.layer-btn:hover {
  background: rgba(0, 0, 0, 0.05);
}

.layer-locked {
  opacity: 0.7;
  background-color: #555555;
}
</style>

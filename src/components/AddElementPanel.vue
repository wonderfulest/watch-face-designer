<template>
  <div class="add-element-panel">
    <div class="panel-content" :class="{ collapsed: isCollapsed }">
      <div v-for="(category, categoryKey) in elementConfigs" :key="categoryKey" class="element-section">
        <div class="section-header">
          <h2>{{ getCategoryLabel(categoryKey) }}</h2>
          <div class="header-line"></div>
        </div>
        <div class="element-grid">
          <button v-for="(config, type) in category" :key="type" @click="addElement(categoryKey, type, config)">
            <Icon :icon="config.icon" class="element-icon" />
            <span class="element-label">{{ config.label }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, getCurrentInstance } from 'vue'
import { elementConfigs } from '@/config/elements'
import { useBaseStore } from '@/stores/baseStore'
import { useTextStore } from '@/stores/elements/textElement'
import { useImageElementStore } from '@/stores/elements/imageElement'
import { useTimeStore } from '@/stores/elements/timeElement'
import { useDateStore } from '@/stores/elements/dateElement'
import { useMetricStore } from '@/stores/elements/metricElement'
import { useIconStore } from '@/stores/elements/iconElement'
import { useDataStore } from '@/stores/elements/dataElement'
import { useLayerStore } from '@/stores/layerStore'
import { useBadgeStore } from '@/stores/elements/badgeElement'
import { useRectStore } from '@/stores/elements/rectElement'
import { useCircleStore } from '@/stores/elements/circleElement'
import { useProgressRingStore } from '@/stores/elements/progressRingElement'
import { useLabelStore } from '@/stores/elements/labelElement'
import { useFontStore } from '@/stores/fontStore'
import emitter from '@/utils/eventBus'

const fontStore = useFontStore()
const textStore = useTextStore()
const imageStore = useImageElementStore()
const timeElement = useTimeStore()
const dateStore = useDateStore()
const metricStore = useMetricStore()
const iconStore = useIconStore()
const dataStore = useDataStore()
const badgeStore = useBadgeStore()
const labelStore = useLabelStore()
const progressRingStore = useProgressRingStore()

const rectStore = useRectStore()
const circleStore = useCircleStore()
const layerStore = useLayerStore()
const isCollapsed = ref(false)

const { proxy } = getCurrentInstance()

const getCategoryLabel = (category) => {
  const labels = {
    basic: '基础元素',
    time: '时间元素',
    metric: '数据元素'
  }
  return labels[category] || category
}

const addElement = async (category, type, config) => {
  try {
    // 加载字体
    await fontStore.loadFont(config.fontFamily)
    // 添加元素
    switch (category) {
      case 'basic':
        if (type === 'text') {
          textStore.addElement(config)
        } else if (type === 'image') {
          imageStore.addElement(config)
        } else if (type === 'badge') {
          badgeStore.addElement(config)
        }
        break
      case 'time':
        if (type === 'time') {
          timeElement.addElement(config)
        } else if (type === 'date') {
          dateStore.addElement(config)
        }
        break
      case 'metric':
        if (type === 'icon') {
          iconStore.addElement({ ...config })
        } else if (type === 'data') {
          dataStore.addElement({ ...config })
        } else if (type === 'label') {
          labelStore.addElement({ ...config })
        }
        break
      case 'shape':
        if (type === 'rect') {
          rectStore.addElement(config)
        } else if (type === 'circle') {
          circleStore.addElement(config)
        } else if (type === 'triangle') {
          // triangleStore.addElement(config);
        }
        break
      case 'progress':
        if (type === 'ring') {
          progressRingStore.addElement(config)
        }
        break
      default:
        break
    }

    // 添加元素后切换到图层面板
    proxy.$parent.switchToLayer()
    isCollapsed.value = true
  } catch (error) {
    console.error('添加元素失败:', error)
    alert(error.message)
  }
}
</script>

<style scoped>
.add-element-panel {
  height: 100%;
  overflow: auto;
}

.panel-content {
  padding: 16px;
}

.element-section {
  margin-bottom: 24px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

h4 {
  margin: 0;
  font-size: 16px;
  color: #333;
  font-weight: 600;
  white-space: nowrap;
}

.header-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(to right, #ddd, transparent);
}

.element-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

button {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100px;
  padding: 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

button:hover {
  background: #f5f5f5;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.element-icon {
  font-size: 32px;
  margin-bottom: 12px;
  color: #409eff;
}

.element-label {
  font-size: 14px;
  color: #333;
}

.panel-content.collapsed {
  max-height: 0;
}
</style>

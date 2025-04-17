<template>
  <div class="design-layout">
    <!-- 编辑器更新日志 -->
    <ChangelogDialog ref="changelogDialog" />
    <!-- 左侧面板 -->
    <div class="left-panel">
      <SidePanel />
    </div>
    <!-- 中间画布区域 -->
    <div class="center-area">
      <Canvas ref="canvasRef" />
    </div>
    <!-- 右侧设置面板 -->
    <div class="right-panel">
      <ElementSettings v-if="baseStore.canvas != null" />
    </div>

    <!-- 导出面板 -->
    <ExportPanel 
      ref="exportPanelRef" 
      :isDialogVisible="isDialogVisible" 
      @update:isDialogVisible="isDialogVisible = $event" 
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, defineProps, watch } from 'vue'
import ChangelogDialog from '@/components/dialogs/ChangelogDialog.vue'
import { useRoute, useRouter } from 'vue-router'
import { nanoid } from 'nanoid'
import Canvas from '@/components/Canvas.vue'
import ElementSettings from '@/components/ElementSettings.vue'
import SidePanel from '@/components/SidePanel.vue'
import ExportPanel from '@/components/ExportPanel.vue'
import appConfig from '@/config/appConfig'
import { useKeyboardShortcuts } from '../composables/useKeyboardShortcuts'
import emitter from '@/utils/eventBus'
import { usePropertiesStore } from '@/stores/properties'
import { useMessageStore } from '@/stores/message'
import { useFontStore } from '@/stores/fontStore'
import { useExportStore } from '@/stores/exportStore'
import { getDesign } from '@/api/design'
import { useTimeStore } from '@/stores/elements/timeElement'
import { useDateStore } from '@/stores/elements/dateElement'
import { useImageElementStore } from '@/stores/elements/imageElement'
import { useBaseStore } from '@/stores/baseStore'
import { useBadgeStore } from '@/stores/elements/badgeElement'
import { useIconStore } from '@/stores/elements/iconElement'
import { useDataStore } from '@/stores/elements/dataElement'
import { useLabelStore } from '@/stores/elements/labelElement'
import { useProgressRingStore } from '@/stores/elements/progressRingElement'
import { useCircleStore } from '@/stores/elements/circleElement'
import { useRectStore } from '@/stores/elements/rectElement'
import { useBluetoothStore } from '@/stores/elements/bluetoothElement'
import { useDisturbStore } from '@/stores/elements/disturbElement'
import { useAlarmsStore } from '@/stores/elements/alarmsElement'
import { useNotificationStore } from '@/stores/elements/notificationElement'
import { decodeElement } from '@/utils/elementCodec'

const propertiesStore = usePropertiesStore()
const imageStore = useImageElementStore()
const route = useRoute()
const router = useRouter()
const baseStore = useBaseStore()
const messageStore = useMessageStore()
const fontStore = useFontStore()
const exportStore = useExportStore()
const canvasRef = ref(null)
const exportPanelRef = ref(null)
const isDialogVisible = ref(false)
const timeStore = useTimeStore()
const dateStore = useDateStore()
const badgeStore = useBadgeStore()
const iconStore = useIconStore()
const dataStore = useDataStore()
const labelStore = useLabelStore()
const progressRingStore = useProgressRingStore()
const circleStore = useCircleStore()
const rectStore = useRectStore()
const bluetoothStore = useBluetoothStore()
const disturbStore = useDisturbStore()
const alarmsStore = useAlarmsStore()
const notificationStore = useNotificationStore()
let saveTimer = null

const changelogDialog = ref(null)

const props = defineProps({
  designKey: {
    type: [String, Number],
    default: null
  }
})
// 监听 exportPanelRef 变化，注册到 store 中
watch(exportPanelRef, (newValue) => {
  if (newValue) {
    exportStore.setExportPanelRef(newValue)
  }
}, { immediate: true })

// 启用键盘快捷键
useKeyboardShortcuts()

// 加载设计配置
const loadDesign = async (id) => {
  try {
    const response = await getDesign(id)
    const designData = response.data
    const config = designData.configJson

    // 加载属性
    propertiesStore.loadProperties(config.properties)
    
    // 设置基础信息
    baseStore.id = id
    baseStore.watchFaceName = designData.name
    baseStore.kpayId = designData.kpayId

    // 设置主题背景图片
    baseStore.themeBackgroundImages = config.themeBackgroundImages

    // 设置文本大小写
    if (config.textCase !== undefined) {
      baseStore.textCase = config.textCase
      // 如果有设置文本大小写，则触发更新
      setTimeout(() => {
        baseStore.setTextCase(config.textCase)
      }, 500) // 等待画布加载完成
    }
    
    // 设置标签长度类型
    if (config.labelLengthType !== undefined) {
      baseStore.labelLengthType = config.labelLengthType
      // 如果有设置标签长度类型，则触发更新
      setTimeout(() => {
        baseStore.setLabelLengthType(config.labelLengthType)
      }, 600) // 在文本大小写设置后执行
    }
    // 设置是否显示数据项单位
    if (config.showUnit !== undefined) {
      baseStore.showUnit = config.showUnit
    }
    // 默认选中第一个颜色
    baseStore.currentThemeIndex = 0

    // 等待画布初始化完成
    await new Promise((resolve) => {
      const checkCanvas = () => {
        if (baseStore.canvas) {
          resolve()
        } else {
          setTimeout(checkCanvas, 100)
        }
      }
      checkCanvas()
    })
    
    // 切换主题背景
    baseStore.toggleThemeBackground()
    // 加载字体
    await fontStore.loadFontsForElements(config.elements)
    // 加载元素到画布
    if (config && config.elements) {
      for (const element of config.elements) {
        try {
          // 使用解码器解码元素
          const decodedElement = decodeElement(element)
          if (!decodedElement) {
            console.warn(`Failed to decode element of type: ${element.type}`)
            continue
          }

          // 根据元素类型调用对应的 store 添加元素
          switch (element.type) {
            case 'global':
              baseStore.loadGlobalElement(decodedElement)
              break
            case 'time':
              await timeStore.addElement(decodedElement)
              break
            case 'date':
              await dateStore.addElement(decodedElement)
              break
            case 'image':
              await imageStore.addElement(decodedElement)
              break
            case 'badge':
              await badgeStore.addElement(decodedElement)
              break
            case 'icon':
              await iconStore.addElement(decodedElement)
              break
            case 'data':
              await dataStore.addElement(decodedElement)
              break
            case 'label':
              await labelStore.addElement(decodedElement)
              break
            case 'progressRing':
              await progressRingStore.addElement(decodedElement)
              break
            case 'circle':
              await circleStore.addElement(decodedElement)
              break
            case 'rect':
              await rectStore.addElement(decodedElement)
              break
            case 'bluetooth':
              await bluetoothStore.addElement(decodedElement)
              break
            case 'disturb':
              await disturbStore.addElement(decodedElement)
              break
            case 'alarms':
              await alarmsStore.addElement(decodedElement)
              break
            case 'notification':
              await notificationStore.addElement(decodedElement)
              break
            default:
              console.warn(`Unknown element type: ${element.type}`)
              messageStore.warning(`未知的元素类型:${element.type}`)
          }
        } catch (err) {
          console.error(`Error loading element of type ${element.type}:`, err)
          messageStore.error(`加载${element.type}元素失败`)
        }
      }

      // 确保所有元素都正确渲染
      baseStore.canvas.requestRenderAll()
    }
  } catch (error) {
    console.error('加载设计失败:', error)
    messageStore.error('加载设计失败')
  }
}

// 初始化新设计
const initNewDesign = async () => {
  // 等待画布初始化完成
  await new Promise((resolve) => {
    const checkCanvas = () => {
      if (baseStore.canvas) {
        resolve()
      } else {
        setTimeout(checkCanvas, 100)
      }
    }
    checkCanvas()
  })

  // 设置默认值
  baseStore.watchFaceName = ''
  baseStore.kpayId = ''
  baseStore.themeBackgroundImages = []
  baseStore.currentThemeIndex = 0
  baseStore.canvas.requestRenderAll()
}

// 设置自动保存
const setupAutoSave = () => {
  if (appConfig.autoSave.enabled) {
    saveTimer = setInterval(() => {
      try {
        console.log('执行自动保存...')
        exportStore.saveConfig()
      } catch (error) {
        console.error('自动保存失败:', error)
      }
    }, appConfig.autoSave.interval)
  }
}

onMounted(() => {
  changelogDialog.value?.checkShowChangelog()
  // 检查URL参数中是否有设计ID
  const designId = route.query.id
  if (designId) {
    loadDesign(designId)
  } else {
    initNewDesign()
  }
  
  // 设置自动保存
  setupAutoSave()

  // 添加 App Properties 快捷键
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === ',') {
      e.preventDefault()
      emitter.emit('open-app-properties')
    }
  })
})

onUnmounted(() => {
  // 清除自动保存定时器
  if (saveTimer) {
    clearInterval(saveTimer)
  }
  // 移除快捷键事件监听
  document.removeEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === ',') {
      e.preventDefault()
      emitter.emit('open-app-properties')
    }
  })
})

// 向外部暴露方法
defineExpose({
  exportPanelRef
})
</script>

<style scoped>
.left-panel {
  width: 300px;
  flex-shrink: 0;
  border-right: 1px solid #e0e0e0;
  background-color: #fff;
}
.design-container {
  height: 100vh;
  display: flex;
  overflow: hidden;
}

.design-layout {
  display: flex;
  width: 100%;
  height: 100%;
}

.left-panel {
  flex-shrink: 0;
  border-right: 1px solid #e0e0e0;
}

.center-area {
  flex-grow: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: auto;
  background-color: #f5f5f5;
}

.right-panel {
  width: 500px; /* 增加宽度 */
  flex-shrink: 0;
  background: white;
  border-left: 1px solid #e0e0e0;
  overflow-y: auto;
  padding: 16px;
  padding-bottom: 76px; /* 原有的16px + 额外的60px空间 */
}
</style>

<template>
  <div class="design-layout">
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

const props = defineProps({
  key: String
})
import { useRoute, useRouter } from 'vue-router'
import { nanoid } from 'nanoid'
import Canvas from '@/components/Canvas.vue'
import ElementSettings from '@/components/ElementSettings.vue'
import SidePanel from '@/components/SidePanel.vue'
import ExportPanel from '@/components/ExportPanel.vue'
import appConfig from '@/config/appConfig'
import { useKeyboardShortcuts } from '../composables/useKeyboardShortcuts'

import { useMessageStore } from '@/stores/message'
import { useFontStore } from '@/stores/fontStore'
import { useExportStore } from '@/stores/exportStore'
import axiosInstance from '@/config/axiosConfig'
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
    const response = await axiosInstance.get(`/designs/${id}`, {
      params: {
        populate: '*'
      }
    })

    const designData = response.data.data
    const config = JSON.parse(designData.attributes.config_json)

    // 设置基础信息
    baseStore.id = id
    baseStore.watchFaceName = designData.attributes.name
    baseStore.kpayId = designData.attributes.kpay_appid
    // 设置主题颜色
    baseStore.themeColors = config.themeColors
    // 设置主题背景图片
    baseStore.themeBackgroundImages = config.themeBackgroundImages
    // 设置主题背景颜色
    if (config.backgroundColorId !== -1 && config.backgroundColorId < baseStore.themeColors[0].length){
      baseStore.themeBackgroundColors[0] = baseStore.themeColors[0][config.backgroundColorId].hex
    }
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
          if (element.type === 'global') {
            baseStore.loadGlobalElement(element)
          } else if (element.type === 'time') {
            const options = timeStore.decodeConfig(element)
            await timeStore.addElement(options)
          } else if (element.type === 'date') {
            const options = dateStore.decodeConfig(element)
            await dateStore.addElement(options)
          } else if (element.type === 'image') {
            const options = imageStore.decodeConfig(element)
            await imageStore.addElement(options)
          } else if (element.type === 'badge') {
            const options = badgeStore.decodeConfig(element)
            await badgeStore.addElement(options)
          } else if (element.type === 'icon') {
            const options = iconStore.decodeConfig(element)
            await iconStore.addElement(options)
          } else if (element.type === 'data') {
            const options = await dataStore.decodeConfig(element)
            await dataStore.addElement(options)
          } else if (element.type === 'label') {
            const options = await labelStore.decodeConfig(element)
            await labelStore.addElement(options)
          } else if (element.type === 'progressRing') {
            const options = await progressRingStore.decodeConfig(element)
            await progressRingStore.addElement(options)
          } else if (element.type === 'circle') {
            const options = await circleStore.decodeConfig(element)
            await circleStore.addElement(options)
          } else if (element.type === 'rect') {
            const options = await rectStore.decodeConfig(element)
            await rectStore.addElement(options)
          } else if (element.type == 'bluetooth') {
            const options = await bluetoothStore.decodeConfig(element)
            await bluetoothStore.addElement(options)
          } else if (element.type == 'disturb') {
            const options = await disturbStore.decodeConfig(element)
            await disturbStore.addElement(options)
          } else if (element.type == 'alarms') {
            const options = await alarmsStore.decodeConfig(element)
            await alarmsStore.addElement(options)
          } else if (element.type == 'notification') {
            const options = await notificationStore.decodeConfig(element)
            await notificationStore.addElement(options)
          } else {
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
  baseStore.themeColors = []
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
  // 检查URL参数中是否有设计ID
  const designId = route.query.id
  if (designId) {
    loadDesign(designId)
  } else {
    initNewDesign()
  }
  
  // 设置自动保存
  setupAutoSave()
})

onUnmounted(() => {
  // 清除自动保存定时器
  if (saveTimer) {
    clearInterval(saveTimer)
  }
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

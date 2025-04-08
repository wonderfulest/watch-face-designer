<template>
  <el-dialog :model-value="isDialogVisible" title="导出配置" class="export-dialog" @open="openDialog" @update:model-value="emit('update:isDialogVisible', $event)" :before-close="closeDialog">
    <div v-if="uploading" class="upload-progress">
      <div class="upload-header">
        <h3>正在上传...</h3>
        <div class="upload-info">
          <div class="info-item">
            <el-tag type="primary" effect="dark" size="large">进度: {{ currentProgress }}%</el-tag>
          </div>
          <div class="info-item">
            <el-tag type="success" effect="dark" size="large">状态: {{ currentStatus }}</el-tag>
          </div>
        </div>
      </div>

      <div class="progress-container">
        <el-progress :percentage="currentProgress" :format="progressFormat" :stroke-width="20" />
        <div class="progress-details">
          <div class="current-progress">
            <span class="progress-label">当前进度:</span>
            <span class="progress-value">{{ currentProgress }}%</span>
          </div>
          <div class="upload-status">
            <span class="status-label">状态:</span>
            <span class="status-value">{{ currentStatus }}</span>
          </div>
        </div>
      </div>

      <div v-if="isUploadTimeout" class="timeout-warning">
        上传时间超过1分钟，可能存在网络问题
        <el-button size="small" type="danger" @click="cancelUpload">取消上传</el-button>
      </div>
    </div>
    <div v-else class="export-preview">
      <div class="preview-header">
        <span>预览</span>
        <div class="preview-actions">
          <el-button size="small" @click="copyConfig" class="copy-btn">
            <Icon icon="solar:copy-bold" />
            复制
          </el-button>
          <el-button type="success" size="small" @click="uploadApp" class="upload-btn">
            <Icon icon="material-symbols:upload" />
            上传
          </el-button>
        </div>
      </div>
      <vue-json-pretty :data="jsonConfig" />
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="closeDialog">取消</el-button>
        <el-button type="primary" @click="dowloadConfig">
          <Icon icon="material-symbols:export-notes-rounded" />
          确认导出
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
/**
 * Export panel script setup
 *
 * This script handles the export panel's business logic, including generating the
 * configuration object, exporting the configuration to a JSON file, uploading the
 * configuration to the server, and copying the configuration to the clipboard.
 */
import { createOrUpdateDesign, updateDesign } from '@/api/design'
import { uploadBase64Image, uploadImageFile } from '@/utils/image'
import { ref, computed } from 'vue'
import _ from 'lodash'
import VueJsonPretty from 'vue-json-pretty'
import 'vue-json-pretty/lib/styles.css'
import { ElMessage, ElProgress, ElLoading, ElTag } from 'element-plus'
import { useMessageStore } from '@/stores/message'
import { getMetricBySymbol } from '@/config/settings'
import { useAuthStore } from '@/stores/auth'
import { useBaseStore } from '@/stores/baseStore'
import { useTimeStore } from '@/stores/elements/timeElement'
import { useDateStore } from '@/stores/elements/dateElement'
import { useMetricStore } from '@/stores/elements/metricElement'
import { useTextStore } from '@/stores/elements/textElement'
import { useIconStore } from '@/stores/elements/iconElement'
import { useDataStore } from '@/stores/elements/dataElement'
import { useImageElementStore } from '@/stores/elements/imageElement'
import { useBadgeStore } from '@/stores/elements/badgeElement'
import { useLabelStore } from '@/stores/elements/labelElement'
import { useCircleStore } from '@/stores/elements/circleElement'
import { useProgressRingStore } from '@/stores/elements/progressRingElement'
import { useRectStore } from '@/stores/elements/rectElement'
import { useBluetoothStore } from '@/stores/elements/bluetoothElement'
import { useRouter } from 'vue-router'
import { useDisturbStore } from '@/stores/elements/disturbElement'
import { useAlarmsStore } from '@/stores/elements/alarmsElement'
import { useNotificationStore } from '@/stores/elements/notificationElement'
const timeStore = useTimeStore()
const dateStore = useDateStore()
const metricStore = useMetricStore()
const textStore = useTextStore()
const messageStore = useMessageStore()
const iconStore = useIconStore()
const dataStore = useDataStore()
const imageStore = useImageElementStore()
const badgeStore = useBadgeStore()
const labelStore = useLabelStore()
const progressRingStore = useProgressRingStore()
const circleStore = useCircleStore()
const rectStore = useRectStore()
const bluetoothStore = useBluetoothStore()
const router = useRouter()
const disturbStore = useDisturbStore()
const alarmsStore = useAlarmsStore()
const notificationStore = useNotificationStore()
const authStore = useAuthStore()
const user = computed(() => authStore.user)
// 定义属性
const props = defineProps({
  isDialogVisible: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:isDialogVisible'])

const baseStore = useBaseStore()

const closeDialog = () => {
  // 使用 emit 通知父组件更新 isDialogVisible
  emit('update:isDialogVisible', false)

  // 清除上传相关状态
  clearTimeout(uploadTimeoutTimer)
  if (loadingInstance) {
    loadingInstance.close()
    loadingInstance = null
  }
}

const jsonConfig = ref({})
const uploading = ref(false)
const isUploadTimeout = ref(false)
let uploadTimeoutTimer = null
let loadingInstance = null
// 使用直接的变量而不是ref
let currentProgress = 0
let currentStatus = ''

const progressFormat = (percentage) => {
  return percentage === 100 ? '完成' : `${percentage}%`
}

// 更新进度和状态的辅助函数
const updateProgress = (status, progress) => {
  currentStatus = status
  currentProgress = progress
  if (loadingInstance) {
    loadingInstance.setText(`${status} (${progress}%)`)
  }
}

const openDialog = () => {
  jsonConfig.value = generateConfig()
  uploading.value = false
  currentProgress = 0
  currentStatus = ''
  isUploadTimeout.value = false
  clearTimeout(uploadTimeoutTimer)
  if (loadingInstance) {
    loadingInstance.close()
    loadingInstance = null
  }
}

const getEncodeConfig = (element) => {
  if (!element) {
    console.error('无效的元素对象')
    return null
  }

  let encodeConfig = null

  try {
    if (element.eleType === 'global') {
      encodeConfig = baseStore.encodeConfig(element)
    } else if (element.eleType === 'badge') {
      encodeConfig = badgeStore.encodeConfig(element)
    } else if (element.eleType === 'time') {
      encodeConfig = timeStore.encodeConfig(element)
    } else if (element.eleType === 'date') {
      encodeConfig = dateStore.encodeConfig(element)
    } else if (element.eleType === 'metric') {
      encodeConfig = metricStore.encodeConfig(element)
    } else if (element.eleType === 'text') {
      encodeConfig = textStore.encodeConfig(element)
    } else if (element.eleType === 'icon') {
      encodeConfig = iconStore.encodeConfig(element)
    } else if (element.eleType === 'data') {
      encodeConfig = dataStore.encodeConfig(element)
    } else if (element.eleType === 'label') {
      encodeConfig = labelStore.encodeConfig(element)
    } else if (element.eleType === 'progressRing') {
      encodeConfig = progressRingStore.encodeConfig(element)
    } else if (element.eleType === 'rect') {
      encodeConfig = rectStore.encodeConfig(element)
    } else if (element.eleType === 'image') {
      encodeConfig = imageStore.encodeConfig(element)
    } else if (element.eleType === 'circle') {
      encodeConfig = circleStore.encodeConfig(element)
    } else if (element.eleType === 'bluetooth') {
      encodeConfig = bluetoothStore.encodeConfig(element)
    } else if (element.eleType === 'disturb') {
      encodeConfig = disturbStore.encodeConfig(element)
    } else if (element.eleType === 'alarms') {
      encodeConfig = alarmsStore.encodeConfig(element)
    } else if (element.eleType === 'notification') {
      encodeConfig = notificationStore.encodeConfig(element)
    }
  } catch (error) {
    console.error('编码配置时出错:', error)
    return null
  }

  return encodeConfig
}

const encodeColor = (color, eleType) => {
  let id = baseStore.themeColors[0].findIndex((c) => c.hex == color)
  if (id == -1) {
    ElMessage.error('未找到颜色变量' + eleType)
  }
  return id
}

// 生成配置对象
const generateConfig = () => {
  if (!baseStore.canvas.getObjects().length) {
    messageStore.warning('没有元素')
    return null
  }
  const config = {
    version: '1.0',
    name: baseStore.watchFaceName,
    kpayId: baseStore.kpayId,
    themeColors: baseStore.themeColors,
    textCase: baseStore.textCase, // 添加文本大小写设置
    labelLengthType: baseStore.labelLengthType, // 添加标签长度类型设置
    showUnit: baseStore.showUnit, // 添加是否显示数据项单位设置
    metricTypes: [],
    elements: []
  }
  // 背景色在颜色数组中的下标，用于配置
  config.backgroundColorId = baseStore.themeColors[0].findIndex((color) => color.hex === baseStore.themeBackgroundColors[0])

  // 背景图片数组
  config.themeBackgroundImages = baseStore.themeBackgroundImages

  const objects = baseStore.canvas.getObjects()
  // 元素在同类中的下标，用于配置
  let dataId = 0,
    imageId = 0,
    timeId = 0,
    dateId = 0
  let metricMap = {}

  // 遍历每个元素
  for (const element of objects) {
    if (element.eleType === 'background-image') continue
    let encodeConfig = getEncodeConfig(element)
    // 获取data
    if (encodeConfig.metricSymbol) {
      const metric = getMetricBySymbol(encodeConfig.metricSymbol)
      if (metric) {
        encodeConfig.metricValue = metric.value // metricValue 作为数据项配置的默认值
      }
    }
    // 根据color获取colorId: 为color数组的索引
    if (encodeConfig.color) {
      encodeConfig.colorId = encodeColor(encodeConfig.color, element.eleType)
    }
    if (encodeConfig.bgColor) {
      encodeConfig.bgColorId = encodeColor(encodeConfig.bgColor, element.eleType)
    }
    if (encodeConfig.stroke) {
      encodeConfig.strokeId = encodeColor(encodeConfig.stroke, element.eleType)
    }

    // 获取imageId
    if (encodeConfig.type == 'image') {
      encodeConfig.imageId = imageId // imageId 用于标识图片配置
      imageId++
    }
    // 获取timeId
    if (encodeConfig.type == 'time') {
      encodeConfig.timeId = timeId // timeId 用于标识时间配置
      timeId++
    }
    // 获取dateId
    if (encodeConfig.type == 'date') {
      encodeConfig.dateId = dateId // dateId 用于标识日期配置
      dateId++
    }
    // 获取dataId
    if ((encodeConfig.type == 'icon' || encodeConfig.type == 'data' || encodeConfig.type == 'label' || encodeConfig.type.indexOf('progress') != -1) && !_.isEmpty(encodeConfig.varName)) {
      if (encodeConfig.metricGroup) {
        // 一组数据
        if (!metricMap.hasOwnProperty(encodeConfig.metricGroup) || metricMap[encodeConfig.metricGroup] == undefined) {
          // metricMap 用于标识数据项配置
          metricMap[encodeConfig.metricGroup] = dataId
          config.metricTypes.push({
            id: dataId,
            value: encodeConfig.metricValue,
            varName: encodeConfig.varName
          })
          dataId++
        }
        encodeConfig.metricId = metricMap[encodeConfig.metricGroup] // metricId 用于标识数据项配置
      } else {
        // 单独数据
        encodeConfig.metricId = dataId // metricId 用于标识数据项配置
        config.metricTypes.push({
          id: dataId,
          value: encodeConfig.metricValue,
          varName: encodeConfig.varName
        })
        dataId++
      }
    }

    config.elements.push(encodeConfig)
  }

  return config
}

// 导出配置
const dowloadConfig = async () => {
  console.log('dowloadConfig', baseStore.watchFaceName, baseStore.kpayId)
  if (!baseStore.watchFaceName || !baseStore.kpayId) {
    messageStore.error('请设置应用名称和kpayId')
    return null
  }
  const config = generateConfig()
  if (!config) return

  const blob = new Blob([JSON.stringify(config)], {
    type: 'application/json'
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `face-${baseStore.kpayId}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

const uploadScreenshot = async () => {
  try {
    // 先捕获最新的画布截图
    const screenshot = await baseStore.captureScreenshot()
    if (screenshot) {
      const screenshotUpload = await uploadBase64Image(screenshot)
      console.log('screenshotUpload res:', screenshotUpload)
      if (screenshotUpload && screenshotUpload.url) {
        return {
          id: screenshotUpload.id,
          url: screenshotUpload.url
        }
      }
    }
  } catch (screenshotError) {
    console.error('上传表盘截图失败:', screenshotError)
    // 截图上传失败不影响整体上传过程
  }
  return {}
}

// 添加一个互斥锁
const isOperationLocked = ref(false)

// 定时轮训保存配置，只需要保存 name, kpayId, configJson 即可
const saveConfig = async () => {
  if (router.currentRoute.value.path !== '/design') {
    messageStore.error('不是设计页面')
    return
  }
  if (!baseStore.watchFaceName || !baseStore.kpayId) {
    messageStore.error('请先设置应用名称和kpayId')
    return
  }

  try {
    const data = {
      name: baseStore.watchFaceName,
      kpayId: baseStore.kpayId,
      configJson: JSON.stringify(generateConfig()),
      userId: user.value.id
    }
    if (baseStore.id) {
      // 如果 id 存在，则更新; 否则创建
      data.documentId = baseStore.id
    }
    const designRes = await createOrUpdateDesign(data)
    console.log('自动保存成功', designRes)
    // 如果 query 中 id 为空，则更新 query 中的 id
    if (!router.currentRoute.value.query.id) {
      router.push({
        path: '/design',
        query: { id: designRes.data.documentId }
      })
    }
    return designRes.data.documentId
  } catch (error) {
    console.error('自动保存失败', error)
    return ''
  }
}

// 上传配置到服务器
const uploadApp = async () => {
  const config = generateConfig()
  if (!config) {
    messageStore.warning('没有可上传的配置')
    return
  }
  if (!baseStore.watchFaceName || !baseStore.kpayId) {
    messageStore.error('请设置应用名称和kpayId')
    return
  }

  // 开始上传，显示进度条
  uploading.value = true
  currentProgress = 0
  currentStatus = '准备上传...'
  isUploadTimeout.value = false

  // 创建全屏遮罩
  loadingInstance = ElLoading.service({
    lock: true,
    text: `${currentStatus} (${currentProgress}%)`,
    background: 'rgba(0, 0, 0, 0.7)'
  })

  // 设置超时定时器，1分钟后显示超时提示
  uploadTimeoutTimer = setTimeout(() => {
    isUploadTimeout.value = true
  }, 60000) // 60秒 = 1分钟

  try {
    // 应用创建
    currentStatus = '创建应用...'
    currentProgress = 10
    if (loadingInstance) {
      loadingInstance.setText(`${currentStatus} (${currentProgress}%)`)
    }

    // 上传背景图片
    currentStatus = '上传背景图片...'
    currentProgress = 30
    if (loadingInstance) {
      loadingInstance.setText(`${currentStatus} (${currentProgress}%)`)
    }
    config.themeBackgroundImages = baseStore.themeBackgroundImages

    // 上传表盘截图 - 对画布进行实时截图
    currentStatus = '上传表盘截图...'
    const screenshotRes = await uploadScreenshot()
    currentProgress = 60
    if (loadingInstance) {
      loadingInstance.setText(`${currentStatus} (${currentProgress}%)`)
    }

    // 配置更新
    currentStatus = '更新配置信息...'
    currentProgress = 80
    if (loadingInstance) {
      loadingInstance.setText(`${currentStatus} (${currentProgress}%)`)
    }

    // 创建或更新表盘设计
    const res = await createOrUpdateDesign({
      documentId: baseStore.id,
      name: baseStore.watchFaceName,
      kpayId: baseStore.kpayId,
      description: baseStore.watchFaceName,
      designStatus: 'draft',
      userId: user.value.id,
      configJson: JSON.stringify(generateConfig()),
      screenshot: screenshotRes.id,
      screenshotUrl: screenshotRes.url
    })
    // 更新 baseStore.id
    baseStore.id = res.documentId
    currentStatus = '上传完成！'
    currentProgress = 100
    if (loadingInstance) {
      loadingInstance.setText(`${currentStatus} (${currentProgress}%)`)
    }

    // 延迟关闭进度条，让用户看到完成状态
    setTimeout(() => {
      uploading.value = false
      messageStore.success('配置上传成功')
      closeDialog()

      // 清除超时定时器和遮罩
      clearTimeout(uploadTimeoutTimer)
      if (loadingInstance) {
        loadingInstance.close()
        loadingInstance = null
      }
    }, 1000)

    return true
  } catch (error) {
    console.error('配置上传失败:', error)
    currentStatus = '上传失败: ' + (error.message || '未知错误')
    currentProgress = 0
    if (loadingInstance) {
      loadingInstance.setText(`${currentStatus} (${currentProgress}%)`)
    }

    // 延迟关闭进度条，让用户看到错误信息
    setTimeout(() => {
      uploading.value = false
      messageStore.error(error.message || '配置上传失败，请稍后重试')

      // 清除超时定时器和遮罩
      clearTimeout(uploadTimeoutTimer)
      if (loadingInstance) {
        loadingInstance.close()
        loadingInstance = null
      }
    }, 2000)
    return false
  }
}

// 取消上传
const cancelUpload = () => {
  currentStatus = '已取消上传'
  currentProgress = 0

  // 关闭遮罩
  if (loadingInstance) {
    loadingInstance.close()
    loadingInstance = null
  }

  // 延迟关闭上传进度条
  setTimeout(() => {
    uploading.value = false
    isUploadTimeout.value = false
    clearTimeout(uploadTimeoutTimer)
  }, 1500)
}

// 复制配置到剪贴板
const copyConfig = () => {
  const config = generateConfig()
  if (!config) return

  const configStr = JSON.stringify(config, null, 2)
  navigator.clipboard
    .writeText(configStr)
    .then(() => {
      messageStore.success('配置已复制到剪贴板')
    })
    .catch(() => {
      messageStore.error('复制失败')
    })
}

// 添加打开导出对话框的方法
const openExportDialog = () => {
  emit('update:isDialogVisible', true)
}

// 暴露方法给父组件
defineExpose({
  uploadApp,
  dowloadConfig,
  saveConfig,
  openExportDialog
})
</script>

<style scoped>
.export-dialog {
  width: 600px;
  :deep(.el-dialog) {
    border-radius: 8px;
  }

  :deep(.el-dialog__header) {
    margin: 0;
    padding: 20px;
    border-bottom: 1px solid #e4e4e4;
  }

  :deep(.el-dialog__body) {
    padding: 20px;
  }

  :deep(.el-dialog__footer) {
    padding: 16px 20px;
    border-top: 1px solid #e4e4e4;
  }
}

.export-preview {
  background: #f5f5f5;
  border-radius: 4px;
  padding: 12px;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  color: #666;
  font-size: 14px;
}

.preview-actions {
  display: flex;
  gap: 8px;
}

.empty-preview {
  padding: 20px;
  text-align: center;
  color: #999;
  font-size: 14px;
  background: #fff;
  border-radius: 4px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.upload-progress {
  padding: 30px 20px;
  text-align: center;
}

.upload-progress h3 {
  margin-bottom: 20px;
  font-size: 18px;
  color: #333;
}

.upload-header {
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.upload-info {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

.info-item {
  font-size: 16px;
}

.progress-container {
  margin: 20px 0;
}

.progress-details {
  display: flex;
  justify-content: space-between;
  margin-top: 15px;
  background-color: #f5f7fa;
  padding: 12px 15px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.upload-status {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-label {
  font-weight: 600;
  color: #606266;
}

.status-value {
  font-size: 15px;
  color: #303133;
  background-color: #ecf5ff;
  padding: 2px 8px;
  border-radius: 3px;
  border-left: 3px solid #409eff;
}

.current-progress {
  display: flex;
  align-items: center;
  gap: 8px;
}

.progress-label {
  font-weight: 600;
  color: #606266;
}

.progress-value {
  font-size: 15px;
  font-weight: bold;
  color: #409eff;
  background-color: #ecf5ff;
  padding: 2px 8px;
  border-radius: 3px;
  border-left: 3px solid #409eff;
}

.timeout-warning {
  margin-top: 20px;
  padding: 10px;
  background-color: #fef0f0;
  color: #f56c6c;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}
</style>

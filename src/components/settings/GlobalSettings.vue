<template>
  <div class="settings-section">
    <div class="setting-item">
      <label>表盘名称</label>
      <el-input type="text" v-model="watchFaceName" @change="updateWatchFaceName" />
    </div>
    <div class="setting-item">
      <label>Kpay ID</label>
      <el-input type="text" v-model="kpayId" @change="updateKpayId" />
    </div>
    
    <!-- 文本大小写设置 -->
    <div class="setting-item">
      <label>文本大小写设置</label>
      <el-select v-model="textCase" placeholder="请选择文本大小写样式" @change="updateTextCase">
        <el-option :value="0" label="默认" />
        <el-option :value="1" label="全大写 (UPPERCASE)" />
        <el-option :value="2" label="全小写 (lowercase)" />
        <el-option :value="3" label="驼峰式 (CamelCase)" />
      </el-select>
      <div class="setting-description">影响日期、标签等文本元素的显示样式</div>
    </div>
    
    <!-- 是否显示数据项单位 -->
    <div class="setting-item">
      <label>是否显示数据项单位</label>
      <el-switch v-model="showUnit" @change="updateShowUnit" />
    </div>

    <!-- 标签长度类型设置 -->
    <div class="setting-item">
      <label>标签长度类型</label>
      <el-select v-model="labelLengthType" placeholder="请选择标签长度类型" @change="updateLabelLengthType">
        <el-option :value="1" label="短文本 (Short)" />
        <el-option :value="2" label="中等文本 (Medium)" />
        <el-option :value="3" label="长文本 (Long)" />
      </el-select>
      <div class="setting-description">仅影响标签元素的显示文本长度</div>
    </div>

    <!-- 主题配置 -->
    <div class="theme-settings">
      <div class="theme-header">
        <h3>主题</h3>
        <div class="theme-actions">
          <el-button size="small" @click="addTheme">新增主题</el-button>
          <el-button size="small" @click="removeTheme" :disabled="currentThemeIndex === 0">删除主题</el-button>
        </div>
      </div>

      <!-- 主题切换 -->
      <div class="theme-selector">
        <el-radio-group v-model="currentThemeIndex">
          <el-radio-button v-for="(theme, index) in themeColors" :key="index" :value="index">主题 {{ index + 1 }}</el-radio-button>
        </el-radio-group>
      </div>

      <!-- 当前主题的颜色变量 -->
      <div class="theme-colors">
        <!-- 颜色变量 名称 和 颜色值 -->
        <div v-for="color in currentThemeColors" :key="color.name" class="color-item">
          <span class="color-name">{{ color.name }}</span>
          <ColorPicker v-model="color.hex" @update:modelValue="(value) => updateThemeColor({ ...color, hex: value })" />
        </div>
      </div>

      <!-- 背景颜色 -->
      <div class="setting-item">
        <label>背景色</label>
        <ColorPicker v-model="backgroundColor" @update:modelValue="updateBackgroundColor" />
      </div>

      <!-- 背景图片选择 -->
      <div class="setting-item">
        <label>背景图片</label>
        <div class="background-image-control">
          <el-upload action="#" :auto-upload="false" :show-file-list="false" accept=".jpg,.jpeg,.png" @change="handleBackgroundImageChange">
            <el-button size="small" type="primary">选择图片</el-button>
          </el-upload>
          <el-button size="small" type="danger" @click="removeBackgroundImage" v-if="currentBackgroundImage">移除图片</el-button>
        </div>
        <div class="background-image-preview" v-if="currentBackgroundImage">
          <img :src="currentBackgroundImage" alt="背景图片预览" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useBaseStore } from '@/stores/baseStore'
import ColorPicker from '@/components/color-picker/index.vue'
import emitter from '@/utils/eventBus'
import { ElSelect, ElOption, ElMessage, ElLoading } from 'element-plus'
import axiosInstance from '@/config/axiosConfig'
import { uploadBase64Image, uploadImageFile } from '@/utils/image'
import { getMetricBySymbol } from '@/config/settings'
const baseStore = useBaseStore()

// 当前主题索引
const currentThemeIndex = computed({
  get: () => baseStore.currentThemeIndex || 0,
  set: (value) => {
    baseStore.currentThemeIndex = value
    // 更新主题
    baseStore.toggleTheme()
  }
})

// 背景颜色
const backgroundColor = computed({
  get: () => baseStore.themeBackgroundColors[currentThemeIndex.value] || '#000000',
  set: (value) => {
    // 确保数组长度与主题数量一致
    while (baseStore.themeBackgroundColors.length < baseStore.themeColors.length) {
      baseStore.themeBackgroundColors.push('#000000')
    }
    baseStore.themeBackgroundColors[currentThemeIndex.value] = value
  }
})

// 更新背景颜色
const updateBackgroundColor = (color) => {
  console.log('updateBackgroundColor', color, 'currentThemeIndex', currentThemeIndex.value)
  baseStore.themeBackgroundColors[currentThemeIndex.value] = color
  // 更新画布背景
  if (baseStore.canvas) {
    baseStore.toggleThemeBackground()
  }
}

// 表盘名称
const watchFaceName = computed({
  get: () => baseStore.watchFaceName,
  set: (value) => (baseStore.watchFaceName = value)
})

// Kpay ID
const kpayId = computed({
  get: () => baseStore.kpayId,
  set: (value) => (baseStore.kpayId = value)
})

// 更新表盘名称
const updateWatchFaceName = () => {
  baseStore.watchFaceName = watchFaceName.value
}

// 更新 Kpay ID
const updateKpayId = () => {
  baseStore.kpayId = kpayId.value
}

// 主题颜色
const themeColors = computed({
  get: () => baseStore.themeColors,
  set: (value) => (baseStore.themeColors = value)
})

// 当前主题的颜色变量
const currentThemeColors = computed({
  get: () => {
    const baseThemeColors = themeColors.value.length > 0 ? themeColors.value[0] : []
    // 如果当前主题为空，填充默认值
    if (!themeColors.value[currentThemeIndex.value]) {
      themeColors.value[currentThemeIndex.value] = baseThemeColors.map((color) => ({
        name: color.name,
        hex: '#ffffff'
      }))
    } // 如果当前主题不为空，与基本主题合并填充默认值
    else {
      themeColors.value[currentThemeIndex.value] = baseThemeColors.map((color, index) => ({
        name: color.name,
        hex: themeColors.value[currentThemeIndex.value][index]?.hex || '#ffffff'
      }))
    }
    // 返回当前主题的颜色变量
    return themeColors.value[currentThemeIndex.value]
  },
  set: (newColors) => {
    themeColors.value[currentThemeIndex.value] = newColors
  }
})

// 新增主题
const addTheme = () => {
  const newTheme = currentThemeColors.value.map((color) => ({
    name: color.name,
    hex: color.hex
  }))
  themeColors.value.push(newTheme)
}

// 删除主题
const removeTheme = () => {
  if (currentThemeIndex.value > 0) {
    themeColors.value.splice(currentThemeIndex.value, 1)
    currentThemeIndex.value = currentThemeIndex.value - 1
  }
}

// 更新主题颜色
const updateThemeColor = (color) => {
  const colorIndex = currentThemeColors.value.findIndex((c) => c.name === color.name)
  if (colorIndex !== -1) {
    // 直接更新当前主题中的颜色
    themeColors.value[currentThemeIndex.value][colorIndex].hex = color.hex
  }
}

// 文本大小写设置
const textCase = computed({
  get: () => baseStore.textCase,
  set: (value) => {
    baseStore.textCase = value
  }
})

// 标签长度类型设置
const labelLengthType = computed({
  get: () => baseStore.labelLengthType,
  set: (value) => {
    baseStore.labelLengthType = value
  }
})

// 是否显示数据项单位
const showUnit = computed({
  get: () => baseStore.showUnit,
  set: (value) => {
    baseStore.showUnit = value
  }
})

// 更新文本大小写设置
const updateTextCase = (value) => {
  console.log('全局设置 - 更新文本大小写设置:', value)

  baseStore.setTextCase(value)
  
  // 打印当前画布上的所有元素类型，以便调试
  if (baseStore.canvas) {
    console.log('当前画布上的元素类型:')
    const objects = baseStore.canvas.getObjects()
    const elementTypes = {}
    
    objects.forEach(obj => {
      if (!elementTypes[obj.eleType]) {
        elementTypes[obj.eleType] = 0
      }
      elementTypes[obj.eleType]++
    })
    
    console.log('元素类型统计:', elementTypes)
  }
}

// 更新是否显示数据项单位
const updateShowUnit = (value) => {
  console.log('全局设置 - 更新是否显示数据项单位:', value)
  baseStore.showUnit = value
  // 更新画布上的数据项单位
  if (baseStore.canvas) {
    const objects = baseStore.canvas.getObjects()
    const elementTypes = {}
    
    for (const obj of objects) {
      if (obj.eleType === 'data') {
        const metric = getMetricBySymbol(obj.metricSymbol)
        obj.set({
          text: metric.defaultValue + (baseStore.showUnit ? metric.unit : ''),
        })
      }
    }
  }
  baseStore.canvas.renderAll()
}

// 更新标签长度类型设置
const updateLabelLengthType = (value) => {
  console.log('全局设置 - 更新标签长度类型:', value)

  baseStore.setLabelLengthType(value)
  
  // 打印当前画布上的标签元素数量，以便调试
  if (baseStore.canvas) {
    console.log('当前画布上的标签元素:')
    const objects = baseStore.canvas.getObjects()
    let labelCount = 0
    
    objects.forEach(obj => {
      if (obj.eleType === 'label') {
        labelCount++
      }
    })
    
    console.log('标签元素数量:', labelCount)
  }
}

// 监听 store 中的值变化
watch(
  () => baseStore.watchFaceName,
  (newName) => {
    if (newName !== watchFaceName.value) {
      watchFaceName.value = newName
    }
  }
)

watch(
  () => baseStore.kpayId,
  (newId) => {
    if (newId !== kpayId.value) {
      kpayId.value = newId
    }
  }
)

watch(
  () => baseStore.textCase,
  (newValue) => {
    if (newValue !== textCase.value) {
      textCase.value = newValue
    }
  }
)

// 背景图片
const currentBackgroundImage = computed({
  get: () => baseStore.themeBackgroundImages[currentThemeIndex.value],
  set: (value) => {
    // 确保数组长度与主题数量一致
    while (baseStore.themeBackgroundImages.length < baseStore.themeColors.length) {
      baseStore.themeBackgroundImages.push('')
    }
    baseStore.themeBackgroundImages[currentThemeIndex.value] = value
  }
})

// 处理背景图片变化
const handleBackgroundImageChange = (file) => {
  console.log('开始处理背景图片变化', file)
  if (!file || !file.raw) {
    console.warn('文件无效', file)
    return
  }

  // 创建 loading 实例
  const loadingInstance = ElLoading.service({
    lock: true,
    text: '正在上传图片...',
    background: 'rgba(0, 0, 0, 0.7)'
  })

  const reader = new FileReader()
  reader.onload = async (e) => {
    try {
      // 确保数组长度与主题数量一致
      while (baseStore.themeBackgroundImages.length < baseStore.themeColors.length) {
        baseStore.themeBackgroundImages.push('')
      }

      // 上传背景图片
      const bgImage = e.target.result
      let imageUpload = {}
      if (bgImage && bgImage.startsWith('data:')) {
        imageUpload = await uploadBase64Image(bgImage)
      } else if (bgImage && bgImage.startsWith('blob:')) {
        imageUpload = await uploadImageFile(bgImage)
      } else if (bgImage && bgImage.startsWith('http')) {
        imageUpload.url = bgImage
      }
      
      if (!imageUpload) {
        throw new Error('上传背景图片失败')
      }

      // 更新当前主题的背景图片
      baseStore.themeBackgroundImages[currentThemeIndex.value] = imageUpload.url

      // 强制更新画布背景
      baseStore.toggleThemeBackground()
      
      ElMessage.success('图片上传成功')
    } catch (error) {
      console.error('上传背景图片失败:', error)
      ElMessage.error('上传背景图片失败')
    } finally {
      // 关闭 loading
      loadingInstance.close()
    }
  }

  reader.onerror = (error) => {
    console.error('读取图片出错', error)
    ElMessage.error('读取图片失败')
    loadingInstance.close()
  }

  reader.readAsDataURL(file.raw)
}

// 移除背景图片
const removeBackgroundImage = () => {
  currentBackgroundImage.value = ''
  baseStore.toggleThemeBackground()
}
</script>

<style scoped>
.setting-item {
  margin-bottom: 16px;
}

.setting-item label {
  display: block;
  margin-bottom: 8px;
  color: #666;
}

.theme-settings {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #eee;
}

.theme-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.theme-header h3 {
  margin: 0;
  font-size: 14px;
  color: #333;
}

.theme-actions {
  display: flex;
  gap: 8px;
}

.theme-selector {
  margin-bottom: 16px;
}

.theme-colors {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.color-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px;
  background: #f5f7fa;
  border-radius: 4px;
  gap: 8px;
}

.color-name {
  font-size: 12px;
  color: #666;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.color-item :deep(.color-picker-wrapper) {
  width: 300px;
  flex-shrink: 0;
}
.background-image-control {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.background-image-preview {
  width: 100%;
  max-width: 200px;
  height: 200px;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid #dcdfe6;
}

.background-image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.setting-description {
  margin-top: 5px;
  font-size: 12px;
  color: #909399;
  line-height: 1.4;
}
</style>

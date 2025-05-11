<template>
  <div class="image-selector">
    <div class="hand-preview upload-preview" @click="triggerUpload">
      <el-icon class="upload-icon"><Plus /></el-icon>
      <span>上传刻度</span>
      <input ref="uploadInput" type="file" accept=".svg" style="display: none" @change="handleUpload" />
    </div>
    <template v-for="(hand, index) in visibleHands" :key="index">
      <div class="hand-preview" 
           :class="{ active: selectedUrl === hand.url }" 
           @click="selectHand(hand.url)"
           @mouseenter="showPreview(hand)"
           @mouseleave="hidePreview">
        <img :src="hand.url" :alt="hand.name" />
        <div v-if="previewHand && previewHand.url === hand.url" class="preview-popup">
          <img :src="hand.url" :alt="hand.name" />
          <div class="preview-name">{{ hand.name }}</div>
        </div>
      </div>
    </template>
    <div v-if="showMore" class="hand-preview more-preview" @click="toggleExpand">
      <el-icon class="more-icon"><ArrowDown /></el-icon>
      <span>更多</span>
    </div>
    <div v-else class="hand-preview more-preview" @click="toggleExpand">
      <el-icon class="more-icon"><ArrowUp /></el-icon>
      <span>收起</span>
    </div>
  </div>
</template>

<script setup>
import { ref, defineEmits, defineProps, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, ArrowDown, ArrowUp } from '@element-plus/icons-vue'
import { uploadBase64Image, uploadHandSVG } from '@/utils/image'

const props = defineProps({
  selectedUrl: {
    type: String,
    required: true
  },
  availableTicks: {
    type: Array,
    required: true
  },
  onSelect: {
    type: Function,
    required: true
  },
  onUpload: {
    type: Function,
    required: true
  }
})

const emit = defineEmits(['update:selectedUrl', 'update:availableTicks'])
const uploadInput = ref(null)
const showMore = ref(true)
const previewHand = ref(null)

// 计算可见的指针数量（每排显示5个，默认显示2排）
const visibleHands = computed(() => {
  if (showMore.value) {
    return props.availableTicks.slice(0, 8) // 显示前10个（2排）
  }
  return props.availableTicks
})

// 切换展开/收起状态
const toggleExpand = () => {
  showMore.value = !showMore.value
}

// 选择指针样式
const selectHand = (url) => {
  props.onSelect(url)
}

// 触发文件上传
const triggerUpload = () => {
  uploadInput.value.click()
}

// 处理文件上传
const handleUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  // 检查文件类型
  if (!file.name.endsWith('.svg')) {
    ElMessage.warning('请上传SVG格式的刻度文件')
    return
  }

  try {
    // 创建文件URL
    const fileUrl = URL.createObjectURL(file)
    console.log('handleUpload fileUrl', fileUrl)
    let imageUpload = {}
    if (fileUrl && fileUrl.startsWith('data:')) {
      imageUpload = await uploadBase64Image(fileUrl)
    } else if (fileUrl && fileUrl.startsWith('blob:')) {
      imageUpload = await uploadHandSVG(fileUrl)
    } else if (fileUrl && fileUrl.startsWith('http')) {
      imageUpload.url = fileUrl
    }

    // 调用上传回调
    props.onUpload(imageUpload.url, file.name)

    ElMessage.success('刻度上传成功')
  } catch (error) {
    console.error('上传刻度失败:', error)
    ElMessage.error('上传刻度失败')
  } finally {
    // 清空文件输入
    event.target.value = ''
  }
}

const showPreview = (hand) => {
  previewHand.value = hand
}

const hidePreview = () => {
  previewHand.value = null
}
</script>

<style scoped>
.image-selector {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
}

.hand-preview {
  width: 60px;
  height: 60px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 6px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  position: relative;
}

.hand-preview:hover {
  border-color: #409eff;
  z-index: 1;
}

.hand-preview:hover img {
  transform: none;
}

.hand-preview img {
  width: 50px;
  height: 50px;
  object-fit: contain;
  transition: transform 0.3s ease;
}

.hand-preview.active {
  border-color: #409eff;
  background-color: #ecf5ff;
}

.hand-preview span {
  font-size: 10px;
  margin-top: 6px;
  text-align: center;
}

.upload-preview {
  border: 1px dashed #dcdfe6;
  background-color: #f5f7fa;
}

.upload-preview:hover {
  border-color: #409eff;
  background-color: #ecf5ff;
}

.upload-icon {
  font-size: 24px;
  color: #909399;
  margin-bottom: 4px;
}

.upload-preview:hover .upload-icon {
  color: #409eff;
}

.more-preview {
  border: 1px dashed #dcdfe6;
  background-color: #f5f7fa;
}

.more-preview:hover {
  border-color: #409eff;
  background-color: #ecf5ff;
}

.more-icon {
  font-size: 24px;
  color: #909399;
  margin-bottom: 4px;
}

.more-preview:hover .more-icon {
  color: #409eff;
}

.preview-popup {
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  background: white;
  padding: 10px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  z-index: 1000;
  width: 180px;
  height: 180px;
  display: flex;
  flex-direction: column;
  align-items: center;
  pointer-events: none;
}

.preview-popup img {
  width: 160px;
  height: 160px;
  object-fit: contain;
}

.preview-name {
  font-size: 12px;
  color: #606266;
  margin-top: 5px;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}
</style>

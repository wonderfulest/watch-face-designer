<template>
  <div class="font-picker">
    <!-- 当前选中的字体预览 -->
    <div class="font-preview" @click="togglePanel">
      <span class="font-name">{{ selectedFontLabel }}</span>
      <span class="preview-text" :style="{ fontFamily: modelValue }">12:23 AM 72°F & Sunny 0123456789</span>
    </div>

    <!-- 字体选择面板 -->
    <div v-if="isOpen" class="font-panel">
      <div class="search-container">
        <input type="text" v-model="searchQuery" placeholder="搜索字体..." class="search-input" @input="filterFonts" />
      </div>
      <div class="font-library">
        <!-- 搜索结果 -->
        <div v-if="searchQuery && filteredFonts.length > 0" class="font-section">
          <div class="section-header">
            <span class="arrow expanded">›</span>
            搜索结果
          </div>
          <div class="section-content">
            <div v-for="group in groupByFamily(filteredFonts)" :key="group.family" class="font-family-group">
              <div class="family-name">{{ group.family }}</div>
              <div v-for="font in group.fonts" :key="font.value" class="font-item" :class="{ active: modelValue === font.value }" @click="selectFont(font)">
                <span class="preview-text" :style="{ fontFamily: font.value }">12:23 AM 72°F & Sunny 0123456789</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 无搜索结果提示 -->
        <div v-if="searchQuery && filteredFonts.length === 0" class="no-results">未找到匹配的字体</div>

        <!-- 字体类型 -->
        <div v-for="section in fontSections" :key="section.label" class="font-section">
          <div class="section-header" @click="toggleSection(section.label)">
            <span class="arrow" :class="{ expanded: expandedSections[section.label] }">›</span>
            {{ section.label.toUpperCase() }}
          </div>
          <div v-if="expandedSections[section.label]" class="section-content">
            <div v-for="group in groupByFamily(section.fonts)" :key="group.family" class="font-family-group">
              <div class="family-name">{{ group.family }}</div>
              <div v-for="font in group.fonts" :key="font.value" class="font-item" :class="{ active: modelValue === font.value }" @click="selectFont(font)">
                <span class="preview-text" :style="{ fontFamily: font.value }">
                  {{ section.label === 'icon' ? '0123456789' : '12:23 AM 72°F & Sunny 0123456789' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 添加自定义字体按钮 -->
      <button class="add-font-btn" @click="addCustomFont">Add Custom Font</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useFontStore } from '@/stores/fontStore'
import { getFonts, createFont, uploadFontFile } from '@/api/fonts'

const props = defineProps({
  modelValue: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['update:modelValue', 'change'])
const fontStore = useFontStore()

const isOpen = ref(false)
const searchQuery = ref('')
const filteredFonts = ref([])

// 使用 store 中的数据
const fontSections = computed(() => fontStore.fontSections)
const expandedSections = computed(() => fontStore.expandedSections)
const selectedFontLabel = computed(() => fontStore.getFontLabel(props.modelValue))

const groupByFamily = (fonts) => {
  const groups = new Map()
  fonts.forEach((font) => {
    if (!groups.has(font.family)) {
      groups.set(font.family, [])
    }
    groups.get(font.family).push(font)
  })
  return Array.from(groups.entries()).map(([family, fonts]) => ({
    family,
    fonts
  }))
}

// 切换面板显示
const togglePanel = () => {
  isOpen.value = !isOpen.value
}

// 切换分组展开/收起
const toggleSection = (section) => {
  fontStore.toggleSection(section)
}

// 选择字体
const selectFont = (font) => {
  emit('update:modelValue', font.value)
  emit('change', font.value)
  fontStore.addRecentFont(font)
  isOpen.value = false
}

// 搜索字体
const filterFonts = () => {
  filteredFonts.value = fontStore.searchFonts(searchQuery.value)
}

// 添加自定义字体
const addCustomFont = async (font) => {
  // ... 其他逻辑 ...
  fontStore.addCustomFont({
    label: fontName,
    value: fontName,
    family: fontName
  })
}

// 监听点击外部关闭面板
const handleOutsideClick = (event) => {
  if (!event.target.closest('.font-picker')) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleOutsideClick)
})

onUnmounted(() => {
  document.removeEventListener('click', handleOutsideClick)
})
</script>

<style scoped>
.font-picker {
  position: relative;
  width: 100%;
}

.font-preview {
  padding: 8px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  cursor: pointer;
  background: white;
  display: flex;
  gap: 12px;
  align-items: center;
}

.font-preview:hover {
  border-color: #409eff;
}

.font-panel {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 4px;
  background: white;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.search-container {
  padding: 16px;
  border-bottom: 1px solid #eee;
}

.search-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
  outline: none;
  transition: all 0.3s;
}

.search-input:focus {
  border-color: #409eff;
}

.no-results {
  padding: 24px;
  text-align: center;
  color: #909399;
  font-size: 14px;
}

.font-library {
  max-height: 800px;
  overflow-y: auto;
}

.font-section {
  border-bottom: 1px solid #eee;
}

.section-header {
  padding: 12px;
  font-size: 13px;
  color: #333;
  cursor: pointer;
  display: flex;
  align-items: center;
  user-select: none;
}

.arrow {
  display: inline-block;
  margin-right: 8px;
  transition: transform 0.3s;
}

.arrow.expanded {
  transform: rotate(90deg);
}

.section-content {
  padding: 8px 0;
}

.family-name {
  font-size: 12px;
  color: #909399;
  padding: 8px 12px;
  background: #f5f7fa;
  border-bottom: 1px solid #eee;
}

.font-item {
  padding: 8px 12px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.font-item:hover {
  background: #f5f7fa;
}

.font-item.active {
  background: #ecf5ff;
  color: #409eff;
}

.font-name {
  font-size: 13px;
  color: #666;
}

.preview-text {
  font-size: 18px;
  color: #333;
}

.no-fonts {
  padding: 12px;
  color: #999;
  font-size: 13px;
  text-align: center;
}

.add-font-btn {
  width: 100%;
  padding: 12px;
  border: none;
  background: none;
  color: #409eff;
  font-size: 14px;
  cursor: pointer;
  border-top: 1px solid #eee;
}

.add-font-btn:hover {
  background: #f5f7fa;
}

::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>

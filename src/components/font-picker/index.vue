<template>
  <div class="font-picker">
    <!-- 当前选中的字体预览 -->
    <div class="font-preview" @click="togglePanel">
      <span class="font-name">{{ selectedFontLabel }}</span>
      <span class="preview-text" :style="{ fontFamily: selectedFontLabel }">12:23 AM 72°F & Sunny</span>
    </div>

    <!-- 字体选择面板 -->
    <div v-if="isOpen" class="font-panel">
      <div class="font-library">
        <!-- 最近使用的字体 -->
        <div v-if="fontStore.recentFonts.length > 0" class="font-section">
          <div class="section-header" @click="toggleSection('recent')">
            <span class="arrow" :class="{ expanded: expandedSections['recent'] }">›</span>
            最近使用
          </div>
          <div v-if="expandedSections['recent']" class="section-content">
            <div
              v-for="font in fontStore.recentFonts"
              :key="font.value"
              class="font-item"
              :class="{ active: modelValue === font.value }"
              @click="selectFont(font.value)"
            >
              <span class="font-name">{{ font.label }}</span>
              <span class="preview-text" :style="{ fontFamily: font.value }">12:23 AM 72°F & Sunny</span>
            </div>
          </div>
        </div>

        <div class="font-section">
          <div class="section-header" @click="toggleSection('sans-serif')">
            <span class="arrow" :class="{ expanded: expandedSections['sans-serif'] }">›</span>
            SANS-SERIF
          </div>
          <div v-if="expandedSections['sans-serif']" class="section-content">
            <div
              v-for="font in sansSerifFonts"
              :key="font.value"
              class="font-item"
              :class="{ active: modelValue === font.value }"
              @click="selectFont(font.value)"
            >
              <span class="font-name">{{ font.label }}</span>
              <span class="preview-text" :style="{ fontFamily: font.value }">12:23 AM 72°F & Sunny</span>
            </div>
          </div>
        </div>

        <div class="font-section">
          <div class="section-header" @click="toggleSection('fixed')">
            <span class="arrow" :class="{ expanded: expandedSections['fixed'] }">›</span>
            FIXED WIDTH
          </div>
          <div v-if="expandedSections['fixed']" class="section-content">
            <div
              v-for="font in fixedWidthFonts"
              :key="font.value"
              class="font-item"
              :class="{ active: modelValue === font.value }"
              @click="selectFont(font.value)"
            >
              <span class="font-name">{{ font.label }}</span>
              <span class="preview-text" :style="{ fontFamily: font.value }">12:23 AM 72°F & Sunny</span>
            </div>
          </div>
        </div>

        <div class="font-section">
          <div class="section-header" @click="toggleSection('serif')">
            <span class="arrow" :class="{ expanded: expandedSections['serif'] }">›</span>
            SERIF
          </div>
          <div v-if="expandedSections['serif']" class="section-content">
            <div
              v-for="font in serifFonts"
              :key="font.value"
              class="font-item"
              :class="{ active: modelValue === font.value }"
              @click="selectFont(font.value)"
            >
              <span class="font-name">{{ font.label }}</span>
              <span class="preview-text" :style="{ fontFamily: font.value }">12:23 AM 72°F & Sunny</span>
            </div>
          </div>
        </div>

        <div class="font-section">
          <div class="section-header" @click="toggleSection('lcd')">
            <span class="arrow" :class="{ expanded: expandedSections['lcd'] }">›</span>
            LCD
          </div>
          <div v-if="expandedSections['lcd']" class="section-content">
            <div
              v-for="font in lcdFonts"
              :key="font.value"
              class="font-item"
              :class="{ active: modelValue === font.value }"
              @click="selectFont(font.value)"
            >
              <span class="font-name">{{ font.label }}</span>
              <span class="preview-text" :style="{ fontFamily: font.value }">12:23 AM 72°F & Sunny</span>
            </div>
          </div>
        </div>

        <div class="font-section">
          <div class="section-header" @click="toggleSection('icon')">
            <span class="arrow" :class="{ expanded: expandedSections['icon'] }">›</span>
            ICON
          </div>
          <div v-if="expandedSections['icon']" class="section-content">
            <div
              v-for="font in iconFonts"
              :key="font.value"
              class="font-item"
              :class="{ active: modelValue === font.value }"
              @click="selectFont(font.value)"
            >
              <span class="font-name">{{ font.label }}</span>
              <span class="preview-text" :style="{ fontFamily: font.value }">0123456789</span>
            </div>
          </div>
        </div>

        <div class="font-section">
          <div class="section-header" @click="toggleSection('custom')">
            <span class="arrow" :class="{ expanded: expandedSections['custom'] }">›</span>
            CUSTOM
          </div>
          <div v-if="expandedSections['custom']" class="section-content">
            <div v-if="customFonts.length === 0" class="no-fonts">
              No custom fonts added yet
            </div>
            <div
              v-else
              v-for="font in customFonts"
              :key="font.value"
              class="font-item"
              :class="{ active: modelValue === font.value }"
              @click="selectFont(font.value)"
            >
              <span class="font-name">{{ font.label }}</span>
              <span class="preview-text" :style="{ fontFamily: font.value }">12:23 AM 72°F & Sunny</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 添加自定义字体按钮 -->
      <button class="add-font-btn" @click="addCustomFont">
        Add Custom Font
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useFontStore } from '@/stores/fontStore';

const props = defineProps({
  modelValue: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['update:modelValue', 'change']);
const fontStore = useFontStore();

const isOpen = ref(false);
const expandedSections = ref({
  'recent': true,
  'sans-serif': false,
  'fixed': false,
  'serif': false,
  'lcd': true,
  'icon': true,
  'custom': false
});

// 字体列表
const iconFonts = [
  { label: 'super-regular', value: 'super-regular' }
];

const sansSerifFonts = [
  { label: 'Arial', value: 'arial' },
  { label: 'Amiko', value: 'Amiko400' },
  { label: 'Amiko SemiBold', value: 'Amiko600' },
  { label: 'Amiko Bold', value: 'Amiko700' },
  // { label: 'Helvetica', value: 'helvetica' },
  // { label: 'Verdana', value: 'verdana' },
  { label: 'Roboto Light', value: 'Roboto-Light' }
];

const fixedWidthFonts = [
  { label: 'Bebas Neue', value: 'bebas_neue' },
  { label: 'Courier New', value: 'courier-new' },
  { label: 'Monaco', value: 'monaco' },
  { label: 'Consolas', value: 'consolas' }
];

const serifFonts = [
  { label: 'Times New Roman', value: 'times-new-roman' },
  { label: 'Georgia', value: 'georgia' },
  { label: 'Palatino', value: 'palatino' }
];

const lcdFonts = [
  { label: 'Patopian 1986', value: 'patopian-1986' },
  { label: 'Minisystem', value: 'minisystem' },
  { label: 'Digital System', value: 'digital-system' }
];

const customFonts = ref([
{ label: 'conthrax-sb', value: 'conthrax-sb' },
{ label: 'VarsityTeam-Bold', value: 'VarsityTeam-Bold' },
]);

const selectedFontLabel = computed(() => {
  const allFonts = [...iconFonts, ...sansSerifFonts, ...fixedWidthFonts, ...serifFonts, ...lcdFonts, ...customFonts.value];
  const found = allFonts.find(font => font.value === props.modelValue);
  return found ? found.label : props.modelValue;
});

// 切换面板显示
const togglePanel = () => {
  isOpen.value = !isOpen.value;
};

// 切换分组展开/收起
const toggleSection = (section) => {
  expandedSections.value[section] = !expandedSections.value[section];
};

// 选择字体
const selectFont = (font) => {
  emit('update:modelValue', font);
  emit('change', font);
  fontStore.addRecentFont(font);
  isOpen.value = false;
};

// 添加自定义字体
const addCustomFont = () => {
  // TODO: 实现添加自定义字体的功能
  ('Add custom font');
};

// 监听点击外部关闭面板
const handleOutsideClick = (event) => {
  if (!event.target.closest('.font-picker')) {
    isOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleOutsideClick);
  fontStore.loadRecentFonts();
});

onUnmounted(() => {
  document.removeEventListener('click', handleOutsideClick);
});
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

.font-library {
  max-height: 400px;
  overflow-y: auto;
}

.font-section {
  border-bottom: 1px solid #eee;
}

.section-header {
  padding: 12px;
  font-size: 13px;
  font-weight: 500;
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
  font-size: 14px;
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

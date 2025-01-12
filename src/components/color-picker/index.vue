<template>
  <div class="color-picker-wrapper" @click.stop>
    <div class="color-input" @click="togglePicker">
      <input
        :value="modelValue === 'transparent' ? 'transparent' : modelValue"
        readonly
        :class="{ 'transparent-input': modelValue === 'transparent' }"
        :style="{
          backgroundColor: modelValue === 'transparent' ? 'transparent' : modelValue
        }"
      >
    </div>
    <div v-if="isOpen" class="color-picker">
      <div class="tabs">
        <div
          class="tab"
          :class="{ active: true }"
        >
          纯色
        </div>
      </div>

      <div class="color-matrix">
        <div
          v-for="color in colorMatrix"
          :key="color"
          class="color-cell"
          :style="{ backgroundColor: color }"
          @click="selectColor(color)"
        ></div>
      </div>

      <div class="color-info">
        <div
          class="color-preview"
          :style="{ backgroundColor: hexColor }"
        ></div>
        <div class="color-inputs">
          <input
            v-model="hexColor"
            class="hex-input"
            maxlength="7"
            @input="updateFromHex"
            placeholder="#000000"
          >
        </div>
      </div>

      <!-- 当前使用的颜色 -->
      <div v-if="usedColors.length > 0" class="recent-colors">
        <div class="recent-colors-title">当前使用的颜色</div>
        <div class="recent-colors-grid">
          <div
            v-for="color in usedColors"
            :key="color"
            class="recent-color"
            :style="{ backgroundColor: color }"
            @click="selectColor(color)"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useColorStore } from '@/stores/colorStore';

const props = defineProps({
  modelValue: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['update:modelValue', 'change']);

// 状态
const isOpen = ref(false);
const hexColor = ref(props.modelValue === 'transparent' ? '#000000' : props.modelValue);

// 颜色store
const colorStore = useColorStore();

// 获取当前使用的颜色
const usedColors = computed(() => colorStore.getAllColors());

// 生成颜色矩阵
const colorMatrix = [
  "#000000", "#000055", "#0000AA", "#0000FF", "#005500", "#005555", "#0055AA", "#0055FF",
  "#00AA00", "#00AA55", "#00AAAA", "#00AAFF", "#00FF00", "#00FF55", "#00FFAA", "#00FFFF",
  "#550000", "#550055", "#5500AA", "#5500FF", "#555500", "#555555", "#5555AA", "#5555FF",
  "#55AA00", "#55AA55", "#55AAAA", "#55AAFF", "#55FF00", "#55FF55", "#55FFAA", "#55FFFF",
  "#AA0000", "#AA0055", "#AA00AA", "#AA00FF", "#AA5500", "#AA5555", "#AA55AA", "#AA55FF",
  "#AAAA00", "#AAAA55", "#AAAAAA", "#AAAAFF", "#AAFF00", "#AAFF55", "#AAFFAA", "#AAFFFF",
  "#FF0000", "#FF0055", "#FF00AA", "#FF00FF", "#FF5500", "#FF5555", "#FF55AA", "#FF55FF",
  "#FFAA00", "#FFAA55", "#FFAAAA", "#FFAAFF", "#FFFF00", "#FFFF55", "#FFFFAA", "#FFFFFF",
  'transparent'
];

// 计算属性
const previewColor = computed(() => hexColor.value);

// 切换颜色选择器
const togglePicker = (event) => {
  event.stopPropagation();
  isOpen.value = !isOpen.value;
};

// 选择颜色
const selectColor = (color) => {
  hexColor.value = color;
  updateColor();
  isOpen.value = false;
};

// 更新颜色
const updateColor = () => {
  emit('update:modelValue', hexColor.value);
  emit('change', hexColor.value);
};

// 从十六进制更新
const updateFromHex = () => {
  if (isValidHex(hexColor.value)) {
    updateColor();
  }
};

// 工具函数
const isValidHex = (hex) => /^#[0-9A-F]{6}$/i.test(hex);

// 监听点击外部关闭
const handleOutsideClick = (event) => {
  if (!event.target.closest('.color-picker-wrapper')) {
    isOpen.value = false;
  }
};

// 添加和移除事件监听
onMounted(() => {
  document.addEventListener('click', handleOutsideClick);
});

onUnmounted(() => {
  document.removeEventListener('click', handleOutsideClick);
});

// 监听 modelValue 变化
watch(() => props.modelValue, (newValue) => {
  if (newValue !== hexColor.value) {
    hexColor.value = newValue === 'transparent' ? '#000000' : newValue;
  }
});
</script>

<style scoped>
.color-picker-wrapper {
  position: relative;
  width: 100%;
}

.color-input {
  width: 100%;
}

.color-input input {
  width: 100%;
  height: 32px;
  padding: 4px 8px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  cursor: pointer;
  text-align: center;
  color: #666;
}

.color-input input.transparent-input {
  background-image: linear-gradient(45deg, #ccc 25%, transparent 25%),
    linear-gradient(-45deg, #ccc 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #ccc 75%),
    linear-gradient(-45deg, transparent 75%, #ccc 75%);
  background-size: 8px 8px;
  background-position: 0 0, 0 4px, 4px -4px, -4px 0px;
}

.color-input input.transparent-input::after {
  content: "×";
  display: inline-block;
  color: #ff4d4f;
  font-weight: bold;
  margin-left: 4px;
}

.color-input input:hover {
  border-color: #409eff;
}

.color-picker {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 4px;
  z-index: 1000;
  width: 300px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.tabs {
  display: flex;
  margin-bottom: 8px;
  border-bottom: 1px solid #eee;
}

.tab {
  padding: 6px 12px;
  cursor: pointer;
  color: #666;
  font-size: 13px;
}

.tab.active {
  color: #333;
  border-bottom: 2px solid #409EFF;
}

.color-matrix {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 2px;
  margin-bottom: 8px;
}

.color-cell {
  aspect-ratio: 1;
  border-radius: 2px;
  cursor: pointer;
  border: 1px solid #eee;
  transition: transform 0.2s;
  position: relative;
}

.color-cell[style*="transparent"] {
  background-image: linear-gradient(45deg, #ccc 25%, transparent 25%),
    linear-gradient(-45deg, #ccc 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #ccc 75%),
    linear-gradient(-45deg, transparent 75%, #ccc 75%);
  background-size: 8px 8px;
  background-position: 0 0, 0 4px, 4px -4px, -4px 0px;
}

.color-cell[style*="transparent"]::after {
  content: "×";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #ff4d4f;
  font-size: 16px;
  font-weight: bold;
}

.color-cell:hover {
  transform: scale(1.1);
  z-index: 1;
  border-color: #409EFF;
}

.color-info {
  display: flex;
  align-items: center;
  margin: 12px 0;
}

.color-preview {
  width: 32px;
  height: 32px;
  border-radius: 4px;
  margin-right: 8px;
  border: 1px solid #ddd;
}

.color-inputs {
  flex: 1;
  display: flex;
  align-items: center;
}

.hex-input {
  width: 100px;
  padding: 4px 6px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 12px;
}

.recent-colors {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #eee;
}

.recent-colors-title {
  font-size: 12px;
  color: #666;
  margin-bottom: 8px;
}

.recent-colors-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 4px;
}

.recent-color {
  aspect-ratio: 1;
  border-radius: 2px;
  cursor: pointer;
  border: 1px solid #eee;
  transition: transform 0.2s;
}

.recent-color:hover {
  transform: scale(1.1);
  z-index: 1;
  border-color: #409EFF;
}

input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
</style>

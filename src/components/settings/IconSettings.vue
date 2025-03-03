<template>
  <div class="settings-section">
    <div class="setting-item">
      <label>位置</label>
      <div class="position-inputs">
        <div>
          <span>X:</span>
          <input type="number" v-model.number="positionX" @change="updatePosition" />
        </div>
        <div>
          <span>Y:</span>
          <input type="number" v-model.number="positionY" @change="updatePosition" />
        </div>
      </div>
    </div>
    <div class="setting-item">
      <label>对齐方式</label>
      <div class="align-buttons">
        <button v-for="align in originXOptions" :key="align.value" @click="updateOriginX(align.value)" :class="{ active: originX === align.value }" :title="align.label">
          <Icon :icon="align.icon" />
        </button>
      </div>
    </div>
    <div class="setting-item">
      <label>字体大小</label>
      <select v-model.number="fontSize" @change="updateFontSize">
        <option v-for="size in fontSizes" :key="size" :value="size">{{ size }}px</option>
      </select>
    </div>
    <div class="setting-item">
      <label>字体颜色</label>
      <ColorPicker v-model="textColor" @change="updateTextColor" />
    </div>
    <div class="setting-item">
      <label>字体</label>
      <font-picker v-model="fontFamily" @change="updateFontFamily" />
    </div>
    <div class="setting-item">
      <label>数据类型</label>
      <select v-model="metricSymbol" @change="updateIconType">
        <option v-for="(option, index) in DataTypeOptions" :key="index" :value="option.metricSymbol">
          {{ option.label }}
        </option>
      </select>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useBaseStore } from '@/stores/baseStore'
import { useFontStore } from '@/stores/fontStore'

import { fontSizes, originXOptions, DataTypeOptions, getMetricBySymbol } from '@/config/settings'
import ColorPicker from '@/components/color-picker/index.vue'
import FontPicker from '@/components/font-picker/index.vue'

const props = defineProps({
  element: {
    type: Object,
    required: true
  }
})

const baseStore = useBaseStore()
const fontStore = useFontStore()

const fontSize = ref(props.element?.fontSize)
const textColor = ref(props.element?.fill)
const fontFamily = ref(props.element?.fontFamily)
const positionX = ref(Math.round(props.element?.left))
const positionY = ref(Math.round(props.element?.top))
const originX = ref(props.element?.originX)
const metricSymbol = ref(props.element?.metricSymbol)

onMounted(async () => {
  if (fontStore.fonts.length === 0) {
    await fontStore.fetchFonts()
  }
  // 如果有字体，预加载当前字体
  if (fontFamily.value) {
    await fontStore.loadFont(fontFamily.value)
  }
})

const updateFontSize = () => {
  if (!props.element || !baseStore.canvas) return
  props.element.set('fontSize', fontSize.value)
  baseStore.canvas.renderAll()
}

const updateTextColor = () => {
  if (!props.element || !baseStore.canvas) return
  props.element.set({
    fill: textColor.value,
    colorVarName: baseStore.getColorVarName(textColor.value)
  })
  baseStore.canvas.renderAll()
}

const updateFontFamily = async () => {
  if (!props.element || !baseStore.canvas) return

  // 加载新字体
  await fontStore.loadFont(fontFamily.value)

  // 确保字体已加载
  document.fonts.ready.then(() => {
    props.element.set('fontFamily', fontFamily.value)
    baseStore.canvas.renderAll()
  })
}

const updatePosition = () => {
  if (!props.element || !baseStore.canvas) return
  props.element.set({
    left: positionX.value,
    top: positionY.value
  })
  baseStore.canvas.renderAll()
}

const updateIconType = () => {
  if (!props.element || !baseStore.canvas) return
  props.element.set('metricSymbol', metricSymbol.value)
  const metric = getMetricBySymbol(metricSymbol.value)
  props.element.set('text', metric.icon)
  baseStore.canvas.renderAll()
}

// 监听画布上的对象位置变化
watch(
  () => props.element?.left,
  (newLeft, oldLeft) => {
    if (newLeft !== undefined) {
      positionX.value = Math.round(newLeft)
    }
  }
)

watch(
  () => props.element?.top,
  (newTop) => {
    if (newTop !== undefined) {
      positionY.value = Math.round(newTop)
    }
  }
)

// 监听画布上的对象属性变化
watch(
  () => props.element?.fontSize,
  (newSize) => {
    if (newSize !== undefined && newSize !== fontSize.value) {
      fontSize.value = newSize
    }
  }
)

watch(
  () => props.element?.fill,
  (newColor) => {
    if (newColor !== undefined && newColor !== textColor.value) {
      textColor.value = newColor
    }
  }
)

watch(
  () => props.element?.fontFamily,
  (newFont) => {
    if (newFont !== undefined && newFont !== fontFamily.value) {
      fontFamily.value = newFont
    }
  }
)

// 更新方法
const updateOriginX = (value) => {
  if (!props.element || !baseStore.canvas) return
  const obj = props.element
  obj.set({
    originX: value
  })
  originX.value = value
  props.element.setCoords()
  baseStore.canvas.renderAll()
}
</script>

<style scoped>
@import '@/assets/styles/settings.css';
.example-text {
  color: #555;
  margin-left: 1em; /* 使用制表符对齐 */
}

.align-buttons .iconify {
  font-size: 18px;
}
</style>

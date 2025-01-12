<template>
  <div class="settings-section">
    <h3>说明设置</h3>

    <!-- 说明设置 -->
    <div class="setting-item">
      <label>数据类型</label>
      <select v-model="metricSymbol" @change="updateMetricType">
        <option
          v-for="(option, index) in DataTypeOptions"
          :key="index"
          :value="option.metricSymbol"
        >
          {{ option.label }}
        </option>
      </select>
    </div>
    
    <!-- 位置设置 -->
    <div class="setting-item">
      <label>位置</label>
      <div class="position-inputs">
        <div class="input-group">
          <label>X</label>
          <input 
            type="number" 
            v-model.number="positionX" 
            @change="updatePosition"
          />
        </div>
        <div class="input-group">
          <label>Y</label>
          <input 
            type="number" 
            v-model.number="positionY" 
            @change="updatePosition"
          />
        </div>
      </div>
    </div>

    <!-- 字体设置 -->
    <div class="setting-item">
      <label>字体</label>
      <FontPicker 
        v-model="fontFamily"
        @change="updateFont"
      />
    </div>

    <!-- 字体大小 -->
    <div class="setting-item">
      <label>字体大小</label>
      <select v-model.number="fontSize" @change="updateFont">
        <option v-for="size in fontSizes" :key="size" :value="size">
          {{ size }}px
        </option>
      </select>
    </div>

    <!-- 颜色设置 -->
    <div class="setting-item">
      <label>颜色</label>
      <ColorPicker 
        v-model="color"
        @change="updateColor"
      />
    </div>

    <!-- 对齐方式 -->
    <div class="setting-item">
      <label>对齐方式</label>
      <div class="align-buttons">
        <button 
          v-for="align in originXOptions" 
          :key="align.value"
          @click="updateOriginX(align.value)"
          :class="{ active: originX === align.value }"
          :title="align.label"
        >
          <Icon :icon="align.icon" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useBaseStore } from '@/stores/base'
import ColorPicker from '@/components/color-picker/index.vue'
import FontPicker from '@/components/font-picker/index.vue'

import {
  fontSizes,
  originXOptions,
  DataTypeOptions,
  getMetricBySymbol,
} from "@/config/settings";

const props = defineProps({
  element: {
    type: Object,
    required: true
  }
})

const baseStore = useBaseStore()

// 状态
const positionX = ref(0)
const positionY = ref(0)
const text = ref('BATTRY')
const fontSize = ref(20)
const fontFamily = ref('Arial')
const color = ref('#ffffff')
const originX = ref('center')
const metricSymbol = ref(':FIELD_TYPE_HEART_RATE')

// 监听元素变化，同步状态
watch(() => props.element, () => {
  if (!props.element) return
  positionX.value = Math.round(props.element.left)
  positionY.value = Math.round(props.element.top)
  metricSymbol.value = props.element.metricSymbol || ':FIELD_TYPE_HEART_RATE'
  const metric = getMetricBySymbol(metricSymbol.value)
  text.value = metric ? metric.enLabel : 'Label'
  fontSize.value = props.element.fontSize
  fontFamily.value = props.element.fontFamily
  color.value = props.element.fill
  originX.value = props.element.originX
}, { immediate: true })

// 监听画布上的位置变化
watch(() => props.element?.left, (newLeft) => {
  if (newLeft !== undefined) {
    positionX.value = Math.round(newLeft)
  }
}, { immediate: true })

watch(() => props.element?.top, (newTop) => {
  if (newTop !== undefined) {
    positionY.value = Math.round(newTop)
  }
}, { immediate: true })

// 更新位置
const updatePosition = () => {
  if (!props.element) return

  props.element.set({
    left: positionX.value,
    top: positionY.value
  })

  props.element.setCoords()
  baseStore.canvas.renderAll()
}

// 更新文本
const updateMetricType = () => {
  if (!props.element) return
  
  const metric = getMetricBySymbol(metricSymbol.value)
  if (!metric) {
    console.warn('Metric not found for symbol:', metricSymbol.value)
    return
  }

  props.element.set({
    metricSymbol: metricSymbol.value,
    text: metric.enLabel
  })

  baseStore.canvas.renderAll()
}

// 更新字体
const updateFont = () => {
  if (!props.element) return

  props.element.set({
    fontSize: fontSize.value,
    fontFamily: fontFamily.value
  })

  baseStore.canvas.renderAll()
}

// 更新颜色
const updateColor = () => {
  if (!props.element) return

  props.element.set({
    fill: color.value
  })

  baseStore.canvas.renderAll()
}

// 更新对齐方式
const updateOriginX = (value) => {
  if (!props.element) return

  originX.value = value
  props.element.set({
    originX: value
  })

  props.element.setCoords()
  baseStore.canvas.renderAll()
}
</script>

<style scoped>
@import "@/assets/styles/settings.css";

</style>

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
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useBaseStore } from '@/stores/baseStore'
import { useTextStore } from '@/stores/elements/textElement'
import { useFontStore } from '@/stores/fontStore'
import { fontSizes, originXOptions } from '@/config/settings'
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

// 设置项的响应式状态
const fontSize = ref(props.element?.fontSize || 36)
const textColor = ref(props.element?.fill || '#FFFFFF')
const fontFamily = ref(props.element?.fontFamily)
const originX = ref(props.element?.originX || 'center')
const positionX = ref(Math.round(props.element?.left || 0))
const positionY = ref(Math.round(props.element?.top || 0))

// 监听元素属性变化
watch(
  () => props.element,
  (obj) => {
    if (!obj) return
  },
  { deep: true }
)

// 加载字体列表
onMounted(async () => {
  if (fontStore.fonts.length === 0) {
    await fontStore.fetchFonts()
  }
  // 如果有字体，预加载当前字体
  if (fontFamily.value) {
    await fontStore.loadFont(fontFamily.value)
  }
})

// 更新方法
const updateFontSize = () => {
  if (!props.element || !baseStore.canvas) return
  props.element.set('fontSize', fontSize.value)
  baseStore.canvas.renderAll()
}

const updateTextColor = () => {
  if (!props.element || !baseStore.canvas) return
  props.element.set('fill', textColor.value)
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

const updateOriginX = (value) => {
  if (!props.element || !baseStore.canvas) return
  props.element.set({
    originX: value
  })

  originX.value = value
  props.element.setCoords()
  baseStore.canvas.renderAll()
}

const updatePosition = () => {
  if (!props.element || !baseStore.canvas) return
  props.element.set({
    left: positionX.value,
    top: positionY.value
  })
  baseStore.canvas.renderAll()
}

// 监听画布上的对象变化
watch(
  () => props.element?.left,
  (newLeft) => {
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

// 监听字体大小变化
watch(
  () => props.element?.fontSize,
  (newFontSize) => {
    if (newFontSize !== undefined) {
      fontSize.value = newFontSize
    }
  }
)
</script>

<style scoped>
@import '@/assets/styles/settings.css';

/* 添加图标样式 */
.align-buttons button {
  display: flex;
  align-items: center;
  justify-content: center;
}

.align-buttons .iconify {
  font-size: 18px;
}
</style>

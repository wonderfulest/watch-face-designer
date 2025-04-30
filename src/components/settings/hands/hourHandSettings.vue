<template>
  <div class="settings-section">
    <h3>时针设置</h3>

    <el-form ref="formRef" :model="element" label-position="left" label-width="100px">
      <!-- 图片选择 -->
      <div class="setting-item">
        <label>指针样式</label>
        <div class="image-selector">
          <div 
            v-for="(hand, index) in availableHands" 
            :key="index"
            class="hand-preview"
            :class="{ active: element.imageUrl === hand.url }"
            @click="selectHand(hand.url)"
          >
            <img :src="hand.url" :alt="hand.name" />
            <span>{{ hand.name }}</span>
          </div>
        </div>
      </div>

      <!-- 位置设置 -->
      <div class="setting-item">
        <label>位置</label>
        <div class="position-inputs">
          <div class="input-group">
            <label>X</label>
            <input type="number" :value="element.left" @input="(e) => (element.left = Number(e.target.value))" @change="updatePosition" />
          </div>
          <div class="input-group">
            <label>Y</label>
            <input type="number" :value="element.top" @input="(e) => (element.top = Number(e.target.value))" @change="updatePosition" />
          </div>
        </div>
      </div>

      <!-- 尺寸设置 -->
      <div class="setting-item">
        <label>尺寸</label>
        <div class="size-inputs">
          <div class="input-group">
            <label>高度</label>
            <input type="number" :value="Math.round(element.height * element.scaleY)" min="1" max="300" @change="onHeightChange($event)" />
          </div>
        </div>
        <label>缩放比例</label>
        <div class="scale-inputs">
          <div class="scale-input">
            <label>X</label>
            <input type="number" :value="element.scaleX.toFixed(2)" readonly />
          </div>
          <div class="scale-input">
            <label>Y</label>
            <input type="number" :value="element.scaleY.toFixed(2)" readonly />
          </div>
        </div>
      </div>

      <!-- 旋转角度设置 -->
      <div class="setting-item">
        <div class="setting-header">
          <label>旋转角度</label>
          <el-tooltip :content="tooltipContent" placement="top" effect="light" :show-after="0" raw-content>
            <el-icon class="help-icon"><Warning /></el-icon>
          </el-tooltip>
        </div>
        <div class="angle-inputs">
          <div class="input-group">
            <label>角度</label>
            <input type="number" :value="element.angle" @input="(e) => (element.angle = Number(e.target.value))" @change="updateElement" />
          </div>
        </div>
      </div>

      <!-- 旋转中心点设置 -->
      <div class="setting-item">
        <div class="setting-header">
          <label>旋转中心点</label>
          <el-tooltip content="设置指针旋转的中心点坐标" placement="top" effect="light" :show-after="0">
            <el-icon class="help-icon"><Warning /></el-icon>
          </el-tooltip>
        </div>
        <div class="position-inputs">
          <div class="input-group">
            <label>X</label>
            <input type="number" :value="element.rotationCenter?.x || 227" @input="(e) => updateRotationCenter({ x: Number(e.target.value), y: element.rotationCenter?.y || 227 })" @change="updateRotationCenter" />
          </div>
          <div class="input-group">
            <label>Y</label>
            <input type="number" :value="element.rotationCenter?.y || 227" @input="(e) => updateRotationCenter({ x: element.rotationCenter?.x || 227, y: Number(e.target.value) })" @change="updateRotationCenter" />
          </div>
        </div>
      </div>

      <!-- 颜色设置 -->
      <div class="setting-item">
        <label>颜色</label>
        <div class="color-inputs">
          <div class="input-group">
            <label>时针颜色</label>
            <ColorPicker
              v-model="element.color"
              @change="
                (val) => {
                  hourHandStore.updateElement(element, {
                    color: val
                  })
                }
              " />
          </div>
          <div class="input-group">
            <label>背景色</label>
            <ColorPicker
              v-model="element.bgColor"
              @change="
                (val) => {
                  hourHandStore.updateElement(element, {
                    bgColor: val
                  })
                }
              " />
          </div>
        </div>
      </div>

      <!-- 测试旋转 -->
      <div class="setting-item">
        <label>测试旋转</label>
        <input
          type="range"
          :value="element.angle"
          min="0"
          max="360"
          @input="
            (e) => {
              element.angle = Number(e.target.value)
              hourHandStore.updateElement(element, {
                angle: element.angle
              })
            }
          " />
        <span>{{ Math.round(element.angle) }}°</span>
      </div>
    </el-form>
  </div>
</template>

<script setup>
import { ref, defineEmits, defineExpose } from 'vue'
import { useBaseStore } from '@/stores/baseStore'
import { useHourHandStore } from '@/stores/elements/hands/hourHandElement'
import ColorPicker from '@/components/color-picker/index.vue'
import { ElTooltip } from 'element-plus'
import { Warning } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const emit = defineEmits(['close'])

const props = defineProps({
  element: {
    type: Object,
    required: true
  }
})

const baseStore = useBaseStore()
const hourHandStore = useHourHandStore()
const formRef = ref(null)

// 可用的指针样式
const availableHands = [
  { name: '样式1', url: '/src/assets/hands/hand1.svg' },
  { name: '样式2', url: '/src/assets/hands/hand2.svg' },
  { name: '样式3', url: '/src/assets/hands/hand3.svg' }
]

// 选择指针样式
const selectHand = (url) => {
  hourHandStore.updateElement(props.element, {
    imageUrl: url
  })
}

// 定义提示内容，使用 HTML 格式
const tooltipContent = `
  <div class="tooltip-content">
    <p>1. 3点钟为0度，6点钟为90度，9点钟为180度，12点钟为270度</p>
    <p>2. 顺时针方向增加角度</p>
    <p>3. 角度范围0到359</p>
  </div>
`
const onHeightChange = (e) => {
  hourHandStore.updateElement(props.element, {
    height: e.target.value,
  })
}
// 更新元素
const updateElement = () => {
  if (!props.element) return
  hourHandStore.updateElement(props.element, {
    left: props.element.left,
    top: props.element.top,
    angle: props.element.angle,
    imageUrl: props.element.imageUrl
  })
}

// 更新位置
const updatePosition = () => {
  if (!props.element) return
  hourHandStore.updateElement(props.element, {
    left: props.element.left,
    top: props.element.top
  })
}

// 更新旋转中心点
const updateRotationCenter = (center) => {
  if (!props.element) return
  hourHandStore.updateElement(props.element, {
    rotationCenter: center
  })
}

// 添加关闭时的验证方法
const handleClose = async () => {
  try {
    await formRef.value.validate()
    emit('close')
  } catch (error) {
    ElMessage.warning('请先完成必填项设置')
  }
}

// 暴露方法给父组件
defineExpose({
  formRef,
  handleClose
})
</script>

<style scoped>
@import '@/assets/styles/settings.css';

.setting-header {
  display: flex;
  align-items: center;
  gap: 4px;
}

.setting-header label {
  display: flex;
  align-items: center;
  line-height: 1;
}

.help-icon {
  color: #909399;
  font-size: 16px;
  cursor: pointer;
  transition: color 0.3s;
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.help-icon:hover {
  color: #409eff;
}

/* 调整提示框样式 */
:deep(.el-tooltip__trigger) {
  display: flex;
  align-items: center;
}

:deep(.el-tooltip__popper) {
  max-width: 300px;
}

:deep(.tooltip-content) {
  line-height: 1.5;
  font-size: 14px;
}

:deep(.tooltip-content p) {
  margin: 0;
  padding: 2px 0;
}

:deep(.tooltip-content p:not(:last-child)) {
  margin-bottom: 4px;
}

/* 图片选择器样式 */
.image-selector {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.hand-preview {
  width: 60px;
  height: 60px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 4px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.hand-preview:hover {
  border-color: #409eff;
}

.hand-preview.active {
  border-color: #409eff;
  background-color: #ecf5ff;
}

.hand-preview img {
  width: 40px;
  height: 40px;
  object-fit: contain;
}

.hand-preview span {
  font-size: 12px;
  margin-top: 4px;
  text-align: center;
}

.scale-inputs {
  display: flex;
  gap: 8px;
}

.scale-input {
  display: flex;
  align-items: center;
  gap: 4px;
}

.scale-input label {
  min-width: 20px;
}

.scale-input input {
  width: 60px;
}
</style>

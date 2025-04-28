<template>
  <div class="settings-section">
    <h3>分针设置</h3>

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
            <label>宽度</label>
            <input type="number" :value="element.width" @input="(e) => (element.width = Number(e.target.value))" @change="updateElement" />
          </div>
          <div class="input-group">
            <label>长度</label>
            <input type="number" :value="element.height / 2" @input="(e) => (element.height = Number(e.target.value) * 2)" @change="updateElement" />
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
            <input type="number" :value="element.rotation" @input="(e) => (element.rotation = Number(e.target.value))" @change="updateElement" />
          </div>
        </div>
      </div>

      <!-- 颜色设置 -->
      <div class="setting-item">
        <label>颜色</label>
        <div class="color-inputs">
          <div class="input-group">
            <label>分针颜色</label>
            <ColorPicker
              v-model="element.color"
              @change="
                (val) => {
                  minuteHandStore.updateElement(element, {
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
                  minuteHandStore.updateElement(element, {
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
          :value="element.rotation"
          min="0"
          max="360"
          @input="
            (e) => {
              element.rotation = Number(e.target.value)
              updateElement()
            }
          " />
        <span>{{ Math.round(element.rotation) }}°</span>
      </div>
    </el-form>
  </div>
</template>

<script setup>
import { ref, defineEmits, defineExpose } from 'vue'
import { useBaseStore } from '@/stores/baseStore'
import { useMinuteHandStore } from '@/stores/elements/hands/minuteHandElement'
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
const minuteHandStore = useMinuteHandStore()
const formRef = ref(null)

// 可用的指针样式
const availableHands = [
  { name: '样式1', url: '/src/assets/hands/hand1.svg' },
  { name: '样式2', url: '/src/assets/hands/hand2.svg' },
  { name: '样式3', url: '/src/assets/hands/hand3.svg' }
]

// 选择指针样式
const selectHand = (url) => {
  minuteHandStore.updateElement(props.element, {
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

// 更新元素
const updateElement = () => {
  if (!props.element) return

  minuteHandStore.updateElement(props.element, {
    left: props.element.left,
    top: props.element.top,
    width: props.element.width,
    height: props.element.height,
    color: props.element.color,
    bgColor: props.element.bgColor,
    rotation: props.element.rotation
  })
}

// 更新位置
const updatePosition = () => {
  if (!props.element) return

  minuteHandStore.updateElement(props.element, {
    left: props.element.left,
    top: props.element.top
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
  handleClose
})
</script>

<style scoped>
.settings-section {
  padding: 20px;
}

.setting-item {
  margin-bottom: 20px;
}

.setting-item label {
  display: block;
  margin-bottom: 10px;
  font-weight: bold;
}

.image-selector {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.hand-preview {
  width: 60px;
  text-align: center;
  cursor: pointer;
  padding: 5px;
  border: 2px solid transparent;
  border-radius: 4px;
}

.hand-preview.active {
  border-color: #409eff;
}

.hand-preview img {
  width: 100%;
  height: auto;
}

.position-inputs,
.size-inputs,
.angle-inputs,
.color-inputs {
  display: flex;
  gap: 10px;
}

.input-group {
  flex: 1;
}

.input-group label {
  display: block;
  margin-bottom: 5px;
}

input[type="number"] {
  width: 100%;
  padding: 8px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

input[type="range"] {
  width: 100%;
  margin: 10px 0;
}

.setting-header {
  display: flex;
  align-items: center;
  gap: 5px;
}

.help-icon {
  cursor: help;
}
</style> 
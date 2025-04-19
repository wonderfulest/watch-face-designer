  <template>
    <div class="settings-section">
      <el-form 
        ref="formRef"
        :model="element" 
        label-position="left" 
        label-width="100px"
        :rules="rules"
      >
      <el-form-item label="目标属性" prop="goalProperty" :rules="[{ required: true, message: '请选择目标属性', trigger: 'change' }]">
        <el-select 
          v-model="element.goalProperty" 
          @change="updateElement"
          placeholder="选择目标属性"
        >
          <el-option 
            v-for="[key, prop] in Object.entries(propertiesStore.allProperties).filter(([_, p]) => p.type === 'goal')" 
            :key="key" 
            :label="prop.title" 
            :value="key" 
          />
        </el-select>
      </el-form-item>
      <!-- 位置设置 -->
      <div class="setting-item">
        <label>位置</label>
        <div class="position-inputs">
          <div class="input-group">
            <label>X</label>
            <input type="number" v-model.number="positionX" @change="updatePosition" />
          </div>
          <div class="input-group">
            <label>Y</label>
            <input type="number" v-model.number="positionY" @change="updatePosition" />
          </div>
        </div>
      </div>
      <!-- 基础属性 -->
      <div class="setting-item">
        <div class="setting-header">
          <label>环形配置</label>
          <el-tooltip
            :content="tooltipContent"
            placement="top"
            effect="light"
            :show-after="0"
            raw-content
          >
            <el-icon class="help-icon"><Warning /></el-icon>
          </el-tooltip>
        </div>
        <div class="angle-inputs">
          <div class="input-group">
            <label>开始</label>
            <input type="number" v-model.number="startAngle" @input="updateElement" />
          </div>
          <div class="input-group">
            <label>结束</label>
            <input type="number" v-model.number="endAngle" @input="updateElement" />
          </div>
        </div>
        <!-- 添加方向选择 -->
        <div class="direction-group">
          <label>方向</label>
          <el-radio-group v-model="counterClockwise" @change="updateElement">
            <el-radio :label="false">顺时针</el-radio> <!-- ARC_CLOCKWISE -->
            <el-radio :label="true">逆时针</el-radio> <!-- ARC_COUNTER_CLOCKWISE -->
          </el-radio-group>
        </div>
      </div>

      <!-- 尺寸属性 -->
      <div class="setting-item">
        <label>尺寸</label>
        <div class="size-inputs">
          <div class="input-group">
            <label>半径</label>
            <input type="number" v-model.number="radius" @input="updateElement" />
          </div>
          <div class="input-group">
            <label>线宽</label>
            <input type="number" v-model.number="strokeWidth" @input="updateElement" />
          </div>
        </div>
      </div>

      <!-- 颜色属性 -->
      <div class="setting-item">
        <label>颜色</label>
        <div class="color-inputs">
          <div class="input-group">
            <label>前景色</label>
            <ColorPicker v-model="color" @change="updateElement" />
          </div>
          <div class="input-group">
            <label>背景色</label>
            <ColorPicker v-model="bgColor" @change="updateElement" />
          </div>
        </div>
      </div>

      <!-- 进度值（用于测试） -->
      <div class="setting-item">
        <label>进度值</label>
        <input type="range" v-model.number="progress" min="0" max="100" @input="updateProgress" />
        <span>{{ progress }}%</span>
      </div>

    </el-form>    
  </div>
      
  </template>

  <script setup>
  import { ref, watch, computed } from 'vue'
  import { useBaseStore } from '@/stores/baseStore'
  import { usePropertiesStore } from '@/stores/propertiesStore'
  import { useGoalArcStore } from '@/stores/elements/goal/goalArcElement'
  import ColorPicker from '@/components/color-picker/index.vue'
  import { DataTypeOptions } from '@/config/settings'
  import { ElTooltip } from 'element-plus'
  import { Warning } from '@element-plus/icons-vue'
  const rules = {
    goalProperty: [
      { required: true, message: '请选择目标属性', trigger: 'change' }
    ]
  }
  const props = defineProps({
    element: {
      type: Object,
      required: true
    }
  })

  const baseStore = useBaseStore()
  const goalArcStore = useGoalArcStore()
  const formRef = ref(null)
  // 获取主圆环和背景圆环
  const mainRing = computed(() => props.element.getObjects().find((obj) => {
    return obj.id.endsWith('_main')
  }))
  const bgRing = computed(() => props.element.getObjects().find((obj) => obj.id.endsWith('_bg')))

  // 状态
  const positionX = ref(0)
  const positionY = ref(0)
  const startAngle = ref(270)
  const endAngle = ref(269)
  const radius = ref(50)
  const strokeWidth = ref(10)
  const color = ref('#2cc8ce')
  const bgColor = ref('#165759')
  const progress = ref(33.3)
  const counterClockwise = ref(false) // 1: 顺时针, -1: 逆时针

  // 定义提示内容，使用 HTML 格式
  const tooltipContent = `
    <div class="tooltip-content">
      <p>1. 3点钟为0度，6点钟为90度，9点钟为180度，12点钟为270度</p>
      <p>2. 顺时针方向增加角度</p>
      <p>3. 角度范围0到359</p>
      <p>4. 开始和结束的角度不应该相同</p>
    </div>
  `

  // 监听元素变化，同步状态
  watch(
    () => props.element,
    () => {
      if (!mainRing.value || !bgRing.value) return
      positionX.value = props.element.left
      positionY.value = props.element.top
      startAngle.value = mainRing.value.startAngle
      endAngle.value = bgRing.value.endAngle
      radius.value = mainRing.value.radius
      strokeWidth.value = mainRing.value.strokeWidth
      color.value = mainRing.value.stroke
      bgColor.value = bgRing.value.stroke
      counterClockwise.value = mainRing.value.counterClockwise
    },
    { immediate: true }
  )

  // 更新元素
  const updateElement = async () => {
    try {
      await formRef.value.validate()
    } catch (error) {
      console.error('表单验证失败:', error)
    }
    goalArcStore.updateElement(props.element, {
      startAngle: startAngle.value,
      endAngle: endAngle.value,
      radius: radius.value,
      strokeWidth: strokeWidth.value,
      color: color.value,
      bgColor: bgColor.value,
      goalProperty: props.element.goalProperty
    })
  }

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

  // 更新进度
  const updateProgress = () => {
    goalArcStore.updateProgress(props.element, progress.value * 1.0 / 100.0)
  }
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
    color: #409EFF;
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
  </style>

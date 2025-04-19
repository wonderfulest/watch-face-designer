<template>
  <div class="settings-section">
    <el-form label-position="left" label-width="100px">
      <el-form-item label="宽度">
        <el-input-number 
          v-model="element.width" 
          :min="50" 
          :max="500" 
          @change="updateElement" 
        />
      </el-form-item>
      
      <el-form-item label="高度">
        <el-input-number 
          v-model="element.height" 
          :min="4" 
          :max="50" 
          @change="updateElement" 
        />
      </el-form-item>

      <el-form-item label="圆角">
        <el-input-number 
          v-model="element.borderRadius" 
          :min="0" 
          :max="25" 
          @change="updateElement" 
        />
      </el-form-item>

      <el-form-item label="内边距">
        <el-input-number 
          v-model="element.padding" 
          :min="0" 
          :max="10" 
          @change="updateElement" 
        />
      </el-form-item>

      <el-form-item label="对齐方式">
        <el-select 
          v-model="element.originX" 
          @change="updateElement"
        >
          <el-option label="居中" value="center" />
        </el-select>
      </el-form-item>

      <el-form-item label="进度">
        <el-slider 
          v-model="element.progress" 
          :min="0" 
          :max="1" 
          :step="0.01" 
          @change="updateElement" 
        />
      </el-form-item>

      <el-form-item label="进度颜色">
        <color-picker 
          v-model="element.color" 
          @change="updateElement" 
        />
      </el-form-item>

      <el-form-item label="背景颜色">
        <color-picker 
          v-model="element.bgColor" 
          @change="updateElement" 
        />
      </el-form-item>

      <el-form-item label="数据变量">
        <el-input 
          v-model="element.varName" 
          @change="updateElement" 
        />
      </el-form-item>

      <el-form-item label="数据类型">
        <el-select 
          v-model="element.metricSymbol" 
          @change="updateElement"
        >
          <el-option 
            v-for="option in metricOptions" 
            :key="option.value" 
            :label="option.label" 
            :value="option.value" 
          />
        </el-select>
      </el-form-item>

      <el-form-item label="前景对齐">
        <el-select 
          v-model="element.progressAlign" 
          @change="updateElement"
        >
          <el-option label="左对齐" value="left" />
          <el-option label="右对齐" value="right" />
        </el-select>
      </el-form-item>

      <el-form-item label="边框宽度">
        <el-input-number 
          v-model="element.borderWidth" 
          :min="0" 
          :max="10" 
          @change="updateElement" 
        />
      </el-form-item>

      <el-form-item label="边框颜色">
        <color-picker 
          v-model="element.borderColor" 
          @change="updateElement" 
        />
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useGoalBarStore } from '@/stores/elements/goal/goalBarElement'
import ColorPicker from '@/components/color-picker/index.vue'
import { DataTypeOptions } from '@/config/settings'

const props = defineProps({
  element: {
    type: Object,
    required: true
  }
})

const goalBarStore = useGoalBarStore()
const metricOptions = DataTypeOptions

const updateElement = () => {
  goalBarStore.updateElement(props.element, {
    width: props.element.width,
    height: props.element.height,
    borderRadius: props.element.borderRadius,
    padding: props.element.padding,
    progressAlign: props.element.progressAlign,
    progress: props.element.progress,
    color: props.element.color,
    bgColor: props.element.bgColor,
    varName: props.element.varName,
    metricSymbol: props.element.metricSymbol,
    borderWidth: props.element.borderWidth,
    borderColor: props.element.borderColor
  })
}
</script>

<style scoped>
.settings-section {
  padding: 16px;
}

.el-form-item {
  margin-bottom: 16px;
}
</style>

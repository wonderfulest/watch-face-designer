<template>
  <div class="settings-section">
    <h3>进度环设置</h3>

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
    <div class="setting-item">
        <label>数据变量</label>
        <input type="text" v-model="varName" @change="updateElement" />   
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
    <!-- 基础属性 -->
    <div class="setting-item">
      <label>角度范围</label>
      <div class="angle-inputs">
        <div class="input-group">
          <label>开始</label>
          <input
            type="number"
            v-model.number="startAngle"
            @input="updateElement"
          />
        </div>
        <div class="input-group">
          <label>结束</label>
          <input
            type="number"
            v-model.number="endAngle"
            @input="updateElement"
          />
        </div>
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
          <input
            type="number"
            v-model.number="strokeWidth"
            @input="updateElement"
          />
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
      <input
        type="range"
        v-model.number="progress"
        min="0"
        max="100"
        @input="updateProgress"
      />
      <span>{{ progress }}%</span>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from "vue";
import { useBaseStore } from "@/stores/baseStore";

import { useProgressRingStore } from "@/stores/elements/progressRingElement";
import ColorPicker from "@/components/color-picker/index.vue";
import { DataTypeOptions } from "@/config/settings";
import { bg } from "element-plus/es/locales.mjs";

const props = defineProps({
  element: {
    type: Object,
    required: true,
  },
});

const baseStore = useBaseStore();
const progressRingStore = useProgressRingStore();


// 获取主圆环和背景圆环
const mainRing = computed(() =>
  props.element.getObjects().find((obj) => obj.id.endsWith("_main"))
);
const bgRing = computed(() =>
  props.element.getObjects().find((obj) => obj.id.endsWith("_bg"))
);

// 状态
const positionX = ref(0);
const positionY = ref(0);
const startAngle = ref(270);
const endAngle = ref(269);
const radius = ref(50);
const strokeWidth = ref(10);
const color = ref("#2cc8ce");
const bgColor = ref("#165759");
const progress = ref(50);
const metricSymbol = ref(":FIELD_TYPE_HEART_RATE");
const varName = ref('');

// 监听元素变化，同步状态
watch(
  () => props.element,
  () => {
    if (!mainRing.value || !bgRing.value) return;
    positionX.value = props.element.left;
    positionY.value = props.element.top;
    startAngle.value = mainRing.value.startAngle;
    endAngle.value = bgRing.value.endAngle;
    radius.value = mainRing.value.radius;
    strokeWidth.value = mainRing.value.strokeWidth;
    color.value = mainRing.value.stroke;
    bgColor.value = bgRing.value.stroke;
    metricSymbol.value = props.element.metricSymbol;
  },
  { immediate: true }
);


// 更新元素
const updateElement = () => {
  if (!mainRing.value || !bgRing.value) return;

  // 获取组的当前位置
  const groupLeft = props.element.left;
  const groupTop = props.element.top;
  const middleAngle = progressRingStore.getMiddleAngle(
    startAngle.value,
    endAngle.value
  );

  // 更新主圆环
  mainRing.value.set({
    radius: radius.value,
    strokeWidth: strokeWidth.value,
    stroke: color.value,
    startAngle: startAngle.value,
    endAngle: middleAngle,
    originX: "center",
    originY: "center",
  });

  // 更新背景圆环
  bgRing.value.set({
    radius: radius.value,
    strokeWidth: strokeWidth.value,
    stroke: bgColor.value,
    startAngle: middleAngle,
    endAngle: endAngle.value,
    originX: "center",
    originY: "center",
  });
  
  // 计算组的新尺寸（考虑线宽）
  const size = (radius.value + strokeWidth.value / 2) * 2;

  // 更新组的位置和尺寸
  props.element.set({
    left: groupLeft,
    top: groupTop,
    originX: "center",
    originY: "center",
    width: size,
    height: size,
    colorVarName: baseStore.getColorVarName(color.value),
    bgColorVarName: baseStore.getColorVarName(bgColor.value),
    varName: varName.value
  });

  // 强制组重新计算边界
  // props.element._calcBounds(true)
  props.element.setCoords();

  // 更新所有坐标
  mainRing.value.setCoords();
  bgRing.value.setCoords();
  baseStore.canvas.renderAll();
};

const updateMetricType = () => {
  if (!props.element || !baseStore.canvas) return;
  props.element.set("metricSymbol", metricSymbol.value);
  baseStore.canvas.renderAll();
};

// 更新位置
const updatePosition = () => {
  if (!props.element) return;

  props.element.set({
    left: positionX.value,
    top: positionY.value,
  });

  props.element.setCoords();
  baseStore.canvas.renderAll();
};

// 更新进度
const updateProgress = () => {
  progressRingStore.updateProgress(props.element, progress.value / 100);
};
</script>

<style scoped>
@import '@/assets/styles/settings.css';

</style>

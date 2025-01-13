<template>
  <div class="settings-section">
    <div class="setting-item">
      <label>位置</label>
      <div class="position-inputs">
        <div>
          <span>X:</span>
          <input
            type="number"
            v-model.number="positionX"
            @change="updatePosition"
          />
        </div>
        <div>
          <span>Y:</span>
          <input
            type="number"
            v-model.number="positionY"
            @change="updatePosition"
          />
        </div>
      </div>
    </div>
    <!-- 尺寸属性 -->
    <div class="setting-item">
      <label>尺寸</label>
      <div class="size-inputs">
        <div class="input-group">
          <label>宽</label>
          <input 
            type="number" 
            v-model.number="width" 
            @input="validateAndUpdateWidth"
            min="0" 
            step="1"
            required
          />
        </div>
        <div class="input-group">
          <label>高</label>
          <input
            type="number"
            v-model.number="height"
            @input="validateAndUpdateHeight"
            min="0"
            step="1"
            required
          />
        </div>
      </div>
      <div class="size-inputs">
        <div class="input-group">
          <label>边框线宽</label>
      <input
        type="number"
        v-model.number="strokeWidth"
        @input="updateElement"
        min="0"
        step="1"
        required
      />
        </div>
        <div class="input-group">
          <label>圆角</label>
      <input
        type="number"
        v-model.number="borderRadius"
        @input="updateElement"
        min="0"
        step="1"
        required
      />
        </div>
      </div>
    </div>


    <!-- 颜色属性 -->
    <div class="setting-item">
      <label>颜色</label>
      <div class="color-inputs">
        <div class="input-group">
          <label>填充色</label>
          <ColorPicker v-model="fill" @change="updateElement" />
        </div>
        <div class="input-group">
          <label>边框色</label>
          <ColorPicker v-model="stroke" @change="updateElement" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import { useBaseStore } from "@/stores/base";
import ColorPicker from "@/components/color-picker/index.vue";

const props = defineProps({
  element: {
    type: Object,
    required: true,
  },
});

const baseStore = useBaseStore();

// 设置项的响应式状态
const positionX = ref(Math.round(props.element.left));
const positionY = ref(Math.round(props.element.top));
const width = ref(props.element.width);
const height = ref(props.element.height);

const fill = ref(props.element.fill);
const stroke = ref(props.element.stroke);
const strokeWidth = ref(props.element.strokeWidth);
const borderRadius = ref(props.element.rx);

// 验证并更新宽高
const validateAndUpdateWidth = (event) => {
  let value = event.target.value;
  if (value === '' || isNaN(value) || value < 1) {
    width.value = 0;
  } else {
    width.value = Math.floor(Number(value));
  }
  updateElement();
};

// 验证并更新线宽
const validateAndUpdateHeight = (event) => {
  let value = event.target.value;
  if (value === '' || isNaN(value) || value < 1) {
    height.value = 0;
  } else {
    height.value = Math.floor(Number(value));
  }
  updateElement();
};

// 监听画布上的对象变化
watch(
  () => props.element?.left,
  (newLeft) => {
    if (newLeft !== undefined) {
      positionX.value = Math.round(newLeft);
    }
  }
);

watch(
  () => props.element.top,
  (newTop) => {
    if (newTop !== undefined) {
      positionY.value = Math.round(newTop);
    }
  }
);

watch(
  () => props.element?.radius,
  (newRadius) => {
    if (newRadius !== undefined) {
      radius.value = newRadius;
    }
  }
);

watch(
  () => props.element?.strokeWidth,
  (newWidth) => {
    if (newWidth !== undefined) {
      strokeWidth.value = newWidth;
    }
  }
);

watch(
  () => props.element?.fill,
  (newColor) => {
    if (newColor !== undefined) {
      fill.value = newColor;
    }
  }
);

watch(
  () => props.element?.stroke,
  (newStroke) => {
    if (newStroke !== undefined) {
      stroke.value = newStroke;
    }
  }
);

const updatePosition = () => {
  if (!props.element || !baseStore.canvas) return;
  props.element.set({
    left: positionX.value,
    top: positionY.value,
  });
  baseStore.canvas.renderAll();
};

const updateElement = () => {
  if (!props.element || !baseStore.canvas) return;
  const opt = {
    width: width.value,
    height: height.value,
    fill: fill.value,
    stroke: stroke.value,
    strokeWidth: strokeWidth.value,
    rx: borderRadius.value,
    ry: borderRadius.value
  }
  props.element.set(opt);
  props.element.setCoords();
  baseStore.canvas.renderAll();
};

</script>

<style scoped>
@import "@/assets/styles/settings.css";

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

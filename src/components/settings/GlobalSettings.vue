<template>
  <div class="settings-section">
    <div class="setting-item">
      <label>表盘名称</label>
      <el-input type="text" v-model="watchFaceName" @change="updateWatchFaceName" />
    </div>
    <div class="setting-item">
      <label>Kpay ID</label>
      <el-input type="text" v-model="kpayId" @change="updateKpayId" />
    </div>
    <div class="setting-item">
      <label>背景颜色</label>
      <el-input type="color" v-model="backgroundColor" @change="updateBackgroundColor" />
    </div>
  </div>
</template>

<script setup>
import { DataTypeOptions, getMetricBySymbol } from "@/config/settings";
import { ref, watch, computed } from "vue";
import { useBaseStore } from "@/stores/base";
import { useFontStore } from '@/stores/fontStore';
import {
  fontSizes,
  originXOptions,
} from "@/config/settings";
import moment from "moment";

const baseStore = useBaseStore();
const fontStore = useFontStore();

const props = defineProps({
  element: {
    type: Object,
    required: true,
  },
});


const backgroundColor = ref(props.element?.fill);

const originX = ref(props.element?.originX);

const metricSymbol = ref(
  props.element?.metricSymbol || ":FIELD_TYPE_HEART_RATE"
);

const watchFaceName = ref('');
const kpayId = ref('');


// 更新表盘名称
const updateWatchFaceName = () => {
  baseStore.watchFaceName = watchFaceName.value;
};

// 更新 Kpay ID
const updateKpayId = () => {
  baseStore.kpayId = kpayId.value;
};

const updateBackgroundColor = () => {
  if (!props.element || !baseStore.canvas) return;
  props.element.set("fill", backgroundColor.value);
  baseStore.canvas.renderAll();
};

// 监听 store 中的值变化
watch(() => baseStore.watchFaceName, (newName) => {
  if (newName !== watchFaceName.value) {
    watchFaceName.value = newName;
  }
});

watch(() => baseStore.kpayId, (newId) => {
  if (newId !== kpayId.value) {
    kpayId.value = newId;
  }
});

</script>

<style scoped>
@import "@/assets/styles/settings.css";
.example-text {
  color: #555;
  margin-left: 1em; /* 使用制表符对齐 */
}

/* 添加图标样式 */
.align-buttons .iconify {
  font-size: 18px;
}
</style>

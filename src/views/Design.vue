<template>
  <div class="design-layout">
    <!-- 左侧面板 -->
    <div class="left-panel">
      <SidePanel />
    </div>
    <!-- 中间画布区域 -->
    <div class="center-area">
      <Canvas ref="canvasRef" />
    </div>
    <!-- 右侧设置面板 -->
    <div class="right-panel">
      <ElementSettings v-if="baseStore.canvas != null" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, defineProps } from "vue";

const props = defineProps({
  key: String
});
import { useRoute } from "vue-router";
import { nanoid } from "nanoid";
import Canvas from "@/components/Canvas.vue";
import ElementSettings from "@/components/ElementSettings.vue";
import SidePanel from "@/components/SidePanel.vue";
import { useKeyboardShortcuts } from "../composables/useKeyboardShortcuts";

import { useMessageStore } from "@/stores/message";
import { useFontStore } from "@/stores/fontStore";
import axiosInstance from "@/config/axiosConfig";
import { useTimeStore } from "@/stores/elements/timeElement";
import { useDateStore } from "@/stores/elements/dateElement";
import { useImageElementStore } from "@/stores/elements/imageElement";
import { useBaseStore } from "@/stores/baseStore";
import { useBadgeStore } from "@/stores/elements/badgeElement";
import { useIconStore } from "@/stores/elements/iconElement";
import { useDataStore } from "@/stores/elements/dataElement";
import { useLabelStore } from "@/stores/elements/labelElement";
import { useProgressRingStore } from "@/stores/elements/progressRingElement";
import { useCircleStore } from "@/stores/elements/circleElement";
import { useRectStore } from "@/stores/elements/rectElement";

const imageStore = useImageElementStore();
const route = useRoute();
const baseStore = useBaseStore();
const messageStore = useMessageStore();
const fontStore = useFontStore();
const canvasRef = ref(null);
const timeStore = useTimeStore();
const dateStore = useDateStore();
const badgeStore = useBadgeStore();
const iconStore = useIconStore();
const dataStore = useDataStore();
const labelStore = useLabelStore();
const progressRingStore = useProgressRingStore();
const circleStore = useCircleStore();
const rectStore = useRectStore();

// 启用键盘快捷键
useKeyboardShortcuts();

// 加载设计配置
const loadDesign = async (id) => {
  try {
    const response = await axiosInstance.get(`/designs/${id}`, {
      params: {
        populate: "*",
      },
    });

    const designData = response.data.data;
    const config = JSON.parse(designData.attributes.config_json);

    console.log(config);
    // 设置基础信息
    baseStore.watchFaceName = designData.attributes.name;
    baseStore.kpayId = designData.attributes.kpay_appid;
    // 设置主题颜色
    baseStore.themeColors = config.themeColors;
    // 设置主题背景图片
    baseStore.themeBackgroundImages = config.themeBackgroundImages;
    // 默认选中第一个颜色
    baseStore.currentThemeIndex = 0;

    // 等待画布初始化完成
    await new Promise((resolve) => {
      const checkCanvas = () => {
        if (baseStore.canvas) {
          resolve();
        } else {
          setTimeout(checkCanvas, 100);
        }
      };
      checkCanvas();
    });
    // 切换主题背景
    baseStore.toggleThemeBackground();
    // 加载元素到画布
    if (config && config.elements) {
      for (const element of config.elements) {
        try {
          if (element.type === "global") {
            baseStore.loadGlobalElement(element);
          } 
          else if (element.type === "time") {
            const options = timeStore.decodeConfig(element);
            await timeStore.addElement(options);
          } 
          else if (element.type === "date") {
            const options = dateStore.decodeConfig(element);
            await dateStore.addElement(options);
          } 
          else if (element.type === "image") {
            const options = imageStore.decodeConfig(element);
            await imageStore.addElement(options);
          } 
          else if (element.type === "badge") {
            const options = badgeStore.decodeConfig(element);
            await badgeStore.addElement(options);
          } 
          else if (element.type === "icon") {
            const options = iconStore.decodeConfig(element);
            await iconStore.addElement(options);
          } 
          else if (element.type === "data") {
            const options = await dataStore.decodeConfig(element);
            await dataStore.addElement(options);
          } 
          else if (element.type === "label") {
            const options = await labelStore.decodeConfig(element);
            await labelStore.addElement(options);
          }
          else if (element.type === "progressRing") {
            const options = await progressRingStore.decodeConfig(element);
            await progressRingStore.addElement(options);
          }
          else if (element.type === "circle") {
            const options = await circleStore.decodeConfig(element);
            await circleStore.addElement(options);
          }
          else if (element.type === "rect") {
            const options = await rectStore.decodeConfig(element);
            await rectStore.addElement(options);
          }
          else {
            console.warn(`Unknown element type: ${element.type}`);
            messageStore.warn(`未知的元素类型:${element.type}`);
          }
        } catch (err) {
          console.error(`Error loading element of type ${element.type}:`, err);
          messageStore.error(`加载${element.type}元素失败`);
        }
      }

      // 确保所有元素都正确渲染
      baseStore.canvas.requestRenderAll();
    }
  } catch (error) {
    console.error("加载设计失败:", error);
    messageStore.error("加载设计失败");
  }
};

// 初始化新设计
const initNewDesign = async () => {
  // 等待画布初始化完成
  await new Promise((resolve) => {
    const checkCanvas = () => {
      if (baseStore.canvas) {
        resolve();
      } else {
        setTimeout(checkCanvas, 100);
      }
    };
    checkCanvas();
  });

  // 设置默认值
  baseStore.watchFaceName = '';
  baseStore.kpayId = '';
  baseStore.themeColors = [];
  baseStore.themeBackgroundImages = [];
  baseStore.currentThemeIndex = 0;
  baseStore.canvas.requestRenderAll();
};

onMounted(() => {
  // 检查URL参数中是否有设计ID
  const designId = route.query.id;
  console.log('onMounted designId', designId);
  if (designId) {
    loadDesign(designId);
  } else {
    initNewDesign();
  }
});
</script>

<style scoped>
.left-panel {
  width: 300px;
  flex-shrink: 0;
  border-right: 1px solid #e0e0e0;
  background-color: #fff;
}
.design-container {
  height: 100vh;
  display: flex;
  overflow: hidden;
}

.design-layout {
  display: flex;
  width: 100%;
  height: 100%;
}

.left-panel {
  flex-shrink: 0;
  border-right: 1px solid #e0e0e0;
}

.center-area {
  flex-grow: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: auto;
  background-color: #f5f5f5;
}

.right-panel {
  width: 500px; /* 增加宽度 */
  flex-shrink: 0;
  background: white;
  border-left: 1px solid #e0e0e0;
  overflow-y: auto;
  padding: 16px;
  padding-bottom: 76px; /* 原有的16px + 额外的60px空间 */
}
</style>

<template>
  <el-dialog
    :model-value="isDialogVisible"
    title="导出配置"
    class="export-dialog"
    @open="openDialog"
    @update:model-value="emit('update:isDialogVisible', $event)"
    :before-close="closeDialog"
  >
    <div class="export-preview">
      <div class="preview-header">
        <span>预览</span>
        <div class="preview-actions">
          <el-button
            size="small"
            @click="copyConfig"
            class="copy-btn"
          >
            <Icon icon="solar:copy-bold" /> 复制
          </el-button>
          <el-button
            type="success"
            size="small"
            @click="uploadApp"
            class="upload-btn"
          >
            <Icon icon="material-symbols:upload" /> 上传
          </el-button>
        </div>
      </div>
      <vue-json-pretty :data="jsonConfig" />
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="closeDialog">取消</el-button>
        <el-button type="primary" @click="dowloadConfig">
          <Icon icon="material-symbols:export-notes-rounded" />
          确认导出
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>


<script setup>
/**
 * Export panel script setup
 * 
 * This script handles the export panel's business logic, including generating the
 * configuration object, exporting the configuration to a JSON file, uploading the
 * configuration to the server, and copying the configuration to the clipboard.
 */
import axiosInstance from "@/config/axiosConfig";
import { ref } from "vue";
import _ from "lodash";
import VueJsonPretty from "vue-json-pretty";
import "vue-json-pretty/lib/styles.css";
import { ElMessage } from 'element-plus';

import { useMessageStore } from "@/stores/message";

import { getMetricBySymbol } from "@/config/settings";

import { useBaseStore } from "@/stores/baseStore";
import { useTimeStore } from "@/stores/elements/timeElement";
import { useDateStore } from "@/stores/elements/dateElement";
import { useMetricStore } from "@/stores/elements/metricElement";
import { useTextStore } from "@/stores/elements/textElement";
import { useIconStore } from "@/stores/elements/iconElement";
import { useDataStore } from "@/stores/elements/dataElement";
import { useImageElementStore } from "@/stores/elements/imageElement";
import { useBadgeStore } from "@/stores/elements/badgeElement";
import { useLabelStore } from "@/stores/elements/labelElement";
import { useCircleStore } from "@/stores/elements/circleElement";
import { useProgressRingStore } from "@/stores/elements/progressRingElement";
import { useRectStore } from "@/stores/elements/rectElement";



const timeStore = useTimeStore();
const dateStore = useDateStore();
const metricStore = useMetricStore();
const textStore = useTextStore();
const messageStore = useMessageStore();
const iconStore = useIconStore();
const dataStore = useDataStore();
const imageStore = useImageElementStore();
const badgeStore = useBadgeStore();
const labelStore = useLabelStore();
const progressRingStore = useProgressRingStore();
const circleStore = useCircleStore();
const rectStore = useRectStore();

// 定义属性
const props = defineProps({
  isDialogVisible: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(["update:isDialogVisible"]);

const baseStore = useBaseStore();

const closeDialog = () => {
  // 使用 emit 通知父组件更新 isDialogVisible
  emit("update:isDialogVisible", false);
};

const jsonConfig = ref({});

const openDialog = () => {
  jsonConfig.value = generateConfig();
};

const getEncodeConfig = (element) => {
  console.log('获取编码配置', element);

  let encodeConfig = null;
  if (element.eleType === "global") {
      encodeConfig = baseStore.encodeConfig(element);
    } else if (element.eleType === "badge") {
      encodeConfig = badgeStore.encodeConfig(element);
    } 
    else if (element.eleType === "time") {
      encodeConfig = timeStore.encodeConfig(element);
    }
    else if (element.eleType === "date") {
      encodeConfig = dateStore.encodeConfig(element);
    } 
    else if (element.eleType === "metric") {
      encodeConfig = metricStore.encodeConfig(element);
    } 
    else if (element.eleType === "text") {
      encodeConfig = textStore.encodeConfig(element);
    } 
    else if (element.eleType === "icon") {
      encodeConfig = iconStore.encodeConfig(element);
    } 
    else if (element.eleType === "data") {
      encodeConfig = dataStore.encodeConfig(element);
    } 
    else if (element.eleType === "label") {
      encodeConfig = labelStore.encodeConfig(element);
    }
    else if (element.eleType === "progressRing") {
      encodeConfig = progressRingStore.encodeConfig(element);
    }
    else if (element.eleType === "rect") {
      encodeConfig = rectStore.encodeConfig(element);
    }
    else if (element.eleType === "image") {
      encodeConfig = imageStore.encodeConfig(element);
    }
    else if (element.eleType === "circle") {
      encodeConfig = circleStore.encodeConfig(element);
    }
    return encodeConfig;
}

const encodeColor = (color, eleType) => {
  let id = baseStore.themeColors[baseStore.currentThemeIndex].findIndex((c) => c.hex == color);
  if (id == -1) {
    ElMessage.error("未找到颜色变量" + eleType);
  }
  return id;
}


// 生成配置对象
const generateConfig = () => {
  if (!baseStore.canvas.getObjects().length) {
    messageStore.warning("没有元素");
    return null;
  }
  const config = {
    version: "1.0",
    name: baseStore.watchFaceName,
    kpayId: baseStore.kpayId,
    themeColors: baseStore.themeColors,
    metricTypes: [],
    elements: [],
  };
  // 背景色在颜色数组中的下标，用于配置
  config.backgroundColorId = baseStore.themeColors[0].findIndex((color) => color.hex === baseStore.themeBackgroundColors[0]);
  if (config.backgroundColorId === -1) {
    messageStore.warning("请配置背景色颜色变量");
    return null;
  }
  // 先初始化空数组，稍后会更新为上传后的URL
  config.themeBackgroundImages = new Array(baseStore.themeBackgroundImages.length).fill('');
  const objects = baseStore.canvas.getObjects();
  // 元素在同类中的下标，用于配置
  let dataId = 0, imageId = 0, timeId = 0, dateId = 0;
  let metricMap = {};
  
  // 遍历每个元素
  for (const element of objects) {
    if (element.eleType === 'background-image') continue;
    let encodeConfig = getEncodeConfig(element);
    // 获取data
    if (encodeConfig.metricSymbol) {
      const metric = getMetricBySymbol(encodeConfig.metricSymbol);
      if (metric) {
        encodeConfig.metricValue = metric.value; // metricValue 作为数据项配置的默认值
      }
    }
    // 根据color获取colorId: 为color数组的索引
    if (encodeConfig.color) {
      encodeConfig.colorId = encodeColor(encodeConfig.color, element.eleType);
    }
    if (encodeConfig.bgColor) {
      encodeConfig.bgColorId = encodeColor(encodeConfig.bgColor, element.eleType);
    }
    if (encodeConfig.stroke) {
      encodeConfig.strokeId = encodeColor(encodeConfig.stroke, element.eleType);
    }
  
    // 获取imageId
    if (encodeConfig.type == 'image') {
      encodeConfig.imageId = imageId; // imageId 用于标识图片配置
      imageId++;
    }
    // 获取timeId
    if (encodeConfig.type == 'time') {
      encodeConfig.timeId = timeId; // timeId 用于标识时间配置
      timeId++;
    }
    // 获取dateId
    if (encodeConfig.type == 'date') {
      encodeConfig.dateId = dateId; // dateId 用于标识日期配置
      dateId++;
    }
    // 获取dataId
    if ((encodeConfig.type == 'icon' || encodeConfig.type == 'data'
    || encodeConfig.type == 'label' || encodeConfig.type.indexOf('progress') != -1
    || encodeConfig.type == 'badge') && encodeConfig.varName !== '' && encodeConfig.varName !== undefined) {
      if (encodeConfig.metricGroup) { // 一组数据
        if (!metricMap.hasOwnProperty(encodeConfig.metricGroup) || metricMap[encodeConfig.metricGroup] == undefined) { // metricMap 用于标识数据项配置
          metricMap[encodeConfig.metricGroup] = dataId;
          config.metricTypes.push({
            id: dataId,
            value: encodeConfig.metricValue,
            varName: encodeConfig.varName
          });
          dataId++;
        } 
        encodeConfig.metricId = metricMap[encodeConfig.metricGroup]; // metricId 用于标识数据项配置
      } else { // 单独数据
        encodeConfig.metricId = dataId; // metricId 用于标识数据项配置
        config.metricTypes.push({
          id: dataId,
          value: encodeConfig.metricValue,
          varName: encodeConfig.varName
        });
        dataId++;
      }
    }
   
    config.elements.push(encodeConfig);
  }

  return config;
};


// 导出配置
const dowloadConfig = async () => {
  console.log('dowloadConfig', baseStore.watchFaceName, baseStore.kpayId)
  if (!baseStore.watchFaceName || !baseStore.kpayId) {
    messageStore.error("请设置应用名称和kpayId");
    return null;
  }
  const config = generateConfig();
  if (!config) return;

  // 上传背景图片
  for (let i = 0; i < baseStore.themeBackgroundImages.length; i++) {
    const bgImage = baseStore.themeBackgroundImages[i];
    let imageUpload = {};
    if (bgImage && bgImage.startsWith('data:')) {
      imageUpload = await uploadBase64Image(bgImage);
    } else if (bgImage && bgImage.startsWith('blob:')) {
      imageUpload = await uploadImageFile(bgImage);
    } else if (bgImage && bgImage.startsWith('http')) {
      imageUpload.url = bgImage;
    }
    if (imageUpload) {
      config.themeBackgroundImages[i] = imageUpload.url;
    }
  }

  const blob = new Blob([JSON.stringify(config)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `face-${baseStore.kpayId}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const createOrUpdateFaceDesign = async () => {
  
  const app = {
    kpay: baseStore.kpayId,
    app_name: baseStore.watchFaceName,
    description: baseStore.watchFaceName,
  };
  try {
    let res = await axiosInstance.get(
      `/designs?filters[kpay_appid][$eq]=${app.kpay}`
    );
    if (res.data.data.length == 0) {
      // 不存在 kpay
      await axiosInstance.post(`/designs`, {
        data: {
          name: app.app_name,
          kpay_appid: app.kpay,
          description: app.description,
        },
      });
    } else {
      // 更新
      const design = {
        name: app.app_name,
        kpay_appid: app.kpay,
        description: app.description,
      };

      await axiosInstance.put(
        `/designs/${res.data.data[0].id}`,
        { data: design },
        {}
      );
    }
    res = await axiosInstance.get(`/designs?filters[kpay_appid][$eq]=${app.kpay}`);
    let body = res.data.data[0];
    return { ...body.attributes, id: body.id };
  } catch (err) {
    messageStore.error(err.message);
  }
  return null;
}

const uploadImageFile = async (blobUrl) => {
  try {
    // 从 blob URL 获取文件数据
    const response = await fetch(blobUrl);
    const blob = await response.blob();
    
    // 创建 FormData 对象
    const formData = new FormData();
    formData.append('files', blob, 'background.png');
    
    // 上传文件
    const res = await axiosInstance.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return res.data[0];
  } catch (error) {
    console.error('上传图片失败:', error);
    throw error;
  }
};

const uploadBase64Image = async (base64Data) => {
  try {
    // Remove data URL prefix if present
    const base64Content = base64Data.includes('base64,') 
      ? base64Data.split('base64,')[1] 
      : base64Data;

    // Convert base64 to blob
    const byteCharacters = atob(base64Content);
    const byteArrays = [];
    
    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);
      const byteNumbers = new Array(slice.length);
      
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
    
    const blob = new Blob(byteArrays, { type: 'image/png' });
    
    // Create FormData and append blob
    const formData = new FormData();
    formData.append('files', blob, 'background.png');
    
    // Upload file
    const res = await axiosInstance.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return res.data[0];
  } catch (error) {
    console.error('Failed to upload base64 image:', error);
    throw error;
  }
};

// 上传配置到服务器
const uploadApp = async () => {
  const config = generateConfig();
  if (!config) {
    messageStore.warning("没有可上传的配置");
    return;
  }
  if (!baseStore.watchFaceName || !baseStore.kpayId) {
    messageStore.error("请设置应用名称和kpayId");
    return;
  }
  
  try {
    // 应用创建
    const designDo = await createOrUpdateFaceDesign();

    // 上传背景图片
    for (let i = 0; i < baseStore.themeBackgroundImages.length; i++) {
      const bgImage = baseStore.themeBackgroundImages[i];
      let imageUpload = {};
      if (bgImage && bgImage.startsWith('data:')) {
        imageUpload = await uploadBase64Image(bgImage);
      } else if (bgImage && bgImage.startsWith('blob:')) {
        imageUpload = await uploadImageFile(bgImage);
      } else if (bgImage && bgImage.startsWith('http')) {
        imageUpload.url = bgImage;
      }
      if (imageUpload) {
        config.themeBackgroundImages[i] = imageUpload.url;
        if (!designDo.background) {
          designDo.background = imageUpload.id;
        }
      }
    }
    // 配置更新
    const userStr = localStorage.getItem('user');
    const user = JSON.parse(userStr);
    designDo["name"] = app.app_name;
    designDo["kpay_appid"] = app.kpay;
    designDo["description"] = app.description;
    designDo["user_id"] = user.id;
    designDo["config_json"] = JSON.stringify(config);
    await updateFaceDesign(designDo);
    messageStore.success("配置上传成功");
    closeDialog();
    return designDo;
  } catch (error) {
    console.error("配置上传失败:", error);
    messageStore.error(error.message || "配置上传失败，请稍后重试");
  }
  return null;
};

const updateFaceDesign = async(design) => {
  try {
    await axiosInstance.put(`/designs/${design.id}`, { data: design }, {});
  } catch (err) {
    return false;
  }
  return true;
}

// 复制配置到剪贴板
const copyConfig = () => {
  const config = generateConfig();
  if (!config) return;
  
  const configStr = JSON.stringify(config, null, 2);
  navigator.clipboard.writeText(configStr).then(() => {
    messageStore.success("配置已复制到剪贴板");
  }).catch(() => {
    messageStore.error("复制失败");
  });
};

// 暴露方法给父组件
defineExpose({
  uploadApp, dowloadConfig
});
</script>

<style scoped>
.export-dialog {
  width: 600px;
  :deep(.el-dialog) {
    border-radius: 8px;
  }
  
  :deep(.el-dialog__header) {
    margin: 0;
    padding: 20px;
    border-bottom: 1px solid #e4e4e4;
  }

  :deep(.el-dialog__body) {
    padding: 20px;
  }

  :deep(.el-dialog__footer) {
    padding: 16px 20px;
    border-top: 1px solid #e4e4e4;
  }
}

.export-preview {
  background: #f5f5f5;
  border-radius: 4px;
  padding: 12px;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  color: #666;
  font-size: 14px;
}

.preview-actions {
  display: flex;
  gap: 8px;
}

.empty-preview {
  padding: 20px;
  text-align: center;
  color: #999;
  font-size: 14px;
  background: #fff;
  border-radius: 4px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>

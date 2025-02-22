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
  
    <!-- 主题配置 -->
    <div class="theme-settings">
      <div class="theme-header">
        <h3>主题</h3>
        <div class="theme-actions">
          <el-button size="small" @click="addTheme">新增主题</el-button>
          <el-button size="small" @click="removeTheme" :disabled="currentThemeIndex === 0">删除主题</el-button>
        </div>
      </div>

      <!-- 主题切换 -->
      <div class="theme-selector">
        <el-radio-group v-model="currentThemeIndex">
          <el-radio-button 
            v-for="(theme, index) in themeColors" 
            :key="index" 
            :value="index"
          >
            主题 {{ index + 1 }}
          </el-radio-button>
        </el-radio-group>
      </div>

      <!-- 当前主题的颜色变量 -->
      <div class="theme-colors">
        <!-- 颜色变量 名称 和 颜色值 -->
        <div 
          v-for="color in currentThemeColors" 
          :key="color.name"
          class="color-item"
        >
          <span class="color-name">{{ color.name }}</span>
          <ColorPicker 
            v-model="color.hex"
            @update:modelValue="(value) => updateThemeColor({...color, hex: value})"
          />
        </div>
      </div>

      <!-- 背景颜色 -->
      <div class="setting-item">
        <label>背景色</label>
        <ColorPicker v-model="backgroundColor" @update:modelValue="updateBackgroundColor" />
      </div>

      <!-- 背景图片选择 -->
      <div class="setting-item">
        <label>背景图片</label>
        <div class="background-image-control">
          <el-upload
            action="#"
            :auto-upload="false"
            :show-file-list="false"
            accept=".jpg,.jpeg,.png"
            @change="handleBackgroundImageChange"
          >
            <el-button size="small" type="primary">选择图片</el-button>
          </el-upload>
          <el-button 
            size="small" 
            type="danger" 
            @click="removeBackgroundImage"
            v-if="currentBackgroundImage"
          >
            移除图片
          </el-button>
        </div>
        <div class="background-image-preview" v-if="currentBackgroundImage">
          <img :src="currentBackgroundImage" alt="背景图片预览" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useBaseStore } from '@/stores/baseStore';
import ColorPicker from '@/components/color-picker/index.vue';

const baseStore = useBaseStore();

// 当前主题索引
const currentThemeIndex = computed({
  get: () => baseStore.currentThemeIndex || 0,
  set: (value) => {
    baseStore.currentThemeIndex = value;
    // 更新主题
    baseStore.toggleTheme();
  }
});

// 背景颜色
const backgroundColor = computed({
  get: () => baseStore.themeBackgroundColors[currentThemeIndex.value] || '#000000',
  set: (value) => {
    // 确保数组长度与主题数量一致
    while (baseStore.themeBackgroundColors.length < baseStore.themeColors.length) {
      baseStore.themeBackgroundColors.push('#000000');
    }
    baseStore.themeBackgroundColors[currentThemeIndex.value] = value;
  }
});

// 更新背景颜色
const updateBackgroundColor = (color) => {
  console.log('updateBackgroundColor', color, 'currentThemeIndex', currentThemeIndex.value);
  baseStore.themeBackgroundColors[currentThemeIndex.value] = color;
  // 更新画布背景
  if (baseStore.canvas) {
    baseStore.toggleThemeBackground();
  }
};

// 表盘名称
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

// 主题颜色
const themeColors = computed({
  get: () => baseStore.themeColors,
  set: (value) => baseStore.themeColors = value
});

// 当前主题的颜色变量
const currentThemeColors = computed({
  get: () => {
    const baseThemeColors = themeColors.value[0] || [];
    // 如果当前主题为空，填充默认值
    if (!themeColors.value[currentThemeIndex.value]) {
      themeColors.value[currentThemeIndex.value] = baseThemeColors.map(color => ({
        name: color.name,
        hex: '#ffffff'
      }));
    } // 如果当前主题不为空，与基本主题合并填充默认值
    else {
      themeColors.value[currentThemeIndex.value] = baseThemeColors.map((color, index) => ({
        name: color.name,
        hex: themeColors.value[currentThemeIndex.value][index]?.hex || '#ffffff'
      }));
    }
    // 返回当前主题的颜色变量
    return themeColors.value[currentThemeIndex.value];
  },
  set: (newColors) => {
    themeColors.value[currentThemeIndex.value] = newColors;
  }
});

// 新增主题
const addTheme = () => {
  const newTheme = currentThemeColors.value.map(color => ({
    name: color.name,
    hex: color.hex
  }));
  themeColors.value.push(newTheme);
};

// 删除主题
const removeTheme = () => {
  if (currentThemeIndex.value > 0) {
    themeColors.value.splice(currentThemeIndex.value, 1);
    currentThemeIndex.value = currentThemeIndex.value - 1;
  }
};

// 更新主题颜色
const updateThemeColor = (color) => {
  const colorIndex = currentThemeColors.value.findIndex(c => c.name === color.name);
  if (colorIndex !== -1) {
    // 直接更新当前主题中的颜色
    themeColors.value[currentThemeIndex.value][colorIndex].hex = color.hex;
  }
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

// 背景图片
const currentBackgroundImage = computed({
  get: () => baseStore.themeBackgroundImages[currentThemeIndex.value],
  set: (value) => {
    // 确保数组长度与主题数量一致
    while (baseStore.themeBackgroundImages.length < baseStore.themeColors.length) {
      baseStore.themeBackgroundImages.push('');
    }
    baseStore.themeBackgroundImages[currentThemeIndex.value] = value;
  }
});

// 处理背景图片变化
const handleBackgroundImageChange = (file) => {
  console.log('开始处理背景图片变化', file);
  if (!file || !file.raw) {
    console.warn('文件无效', file);
    return;
  }
  
  const reader = new FileReader();
  reader.onload = (e) => {
    console.log('图片读取完成', {
      currentThemeIndex: currentThemeIndex.value,
      themeBackgroundImagesLength: baseStore.themeBackgroundImages.length,
      themeColorsLength: baseStore.themeColors.length
    });

    // 确保数组长度与主题数量一致
    while (baseStore.themeBackgroundImages.length < baseStore.themeColors.length) {
      baseStore.themeBackgroundImages.push('');
    }

    // 更新当前主题的背景图片
    baseStore.themeBackgroundImages[currentThemeIndex.value] = e.target.result;
    console.log('背景图片已更新', {
      imageLength: e.target.result.length,
      currentThemeIndex: currentThemeIndex.value,
      allBackgroundImages: baseStore.themeBackgroundImages
    });

    // 强制更新画布背景
    baseStore.toggleThemeBackground();
  };

  reader.onerror = (error) => {
    console.error('读取图片出错', error);
  };

  reader.readAsDataURL(file.raw);
};

// 移除背景图片
const removeBackgroundImage = () => {
  currentBackgroundImage.value = '';
  baseStore.toggleThemeBackground();
};
</script>

<style scoped>
.setting-item {
  margin-bottom: 16px;
}

.setting-item label {
  display: block;
  margin-bottom: 8px;
  color: #666;
}

.theme-settings {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #eee;
}

.theme-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.theme-header h3 {
  margin: 0;
  font-size: 14px;
  color: #333;
}

.theme-actions {
  display: flex;
  gap: 8px;
}

.theme-selector {
  margin-bottom: 16px;
}

.theme-colors {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.color-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px;
  background: #f5f7fa;
  border-radius: 4px;
  gap: 8px;
}

.color-name {
  font-size: 12px;
  color: #666;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.color-item :deep(.color-picker-wrapper) {
  width: 300px;
  flex-shrink: 0;
}
.background-image-control {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.background-image-preview {
  width: 100%;
  max-width: 200px;
  height: 200px;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid #dcdfe6;
}

.background-image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>

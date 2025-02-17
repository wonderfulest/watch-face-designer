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

    <!-- 颜色主题配置 -->
    <div class="theme-settings">
      <div class="theme-header">
        <h3>颜色主题</h3>
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
        <div 
          v-for="color in currentThemeColors" 
          :key="color.name"
          class="color-item"
        >
          <span class="color-name">{{ color.name }}</span>
          <el-input 
            type="color" 
            v-model="color.hex"
            @change="updateThemeColor(color)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useBaseStore } from '@/stores/base';
import { useColorStore } from '@/stores/colorStore';

const baseStore = useBaseStore();
const colorStore = useColorStore();

// 背景颜色
const backgroundColor = computed({
  get: () => baseStore.backgroundColor,
  set: (value) => baseStore.backgroundColor = value
});

// 更新背景颜色
const updateBackgroundColor = (color) => {
  baseStore.backgroundColor = color;
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
  get: () => colorStore.themeColors,
  set: (value) => colorStore.themeColors = value
});

// 当前主题索引
const currentThemeIndex = computed({
  get: () => colorStore.currentThemeIndex || 0,
  set: (value) => {
    colorStore.currentThemeIndex = value;
  }
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
    // console.log('currentThemeIndex', currentThemeIndex.value)
    // console.log('currentThemeColors', themeColors.value[currentThemeIndex.value])
    // console.log('baseThemeColors', baseThemeColors)
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
}

.color-name {
  font-size: 12px;
  color: #666;
}

.color-item :deep(.el-input) {
  width: 80px;
}
</style>

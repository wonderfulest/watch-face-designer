<template>
  <el-dialog
    title="编辑器设置"
    v-model="dialogVisible"
    width="500px"
    :close-on-click-modal="false"
    :close-on-press-escape="true"
  >
    <div class="settings-container">
      <div class="setting-item">
        <div class="setting-label">编辑区背景色</div>
        <div class="setting-control">
          <el-color-picker
            v-model="backgroundColor"
            show-alpha
            @change="handleBackgroundColorChange"
          />
          <div class="color-value">{{ backgroundColor }}</div>
        </div>
      </div>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveSettings">
          确定
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useBaseStore } from '@/stores/baseStore'
import { useMessageStore } from '@/stores/message'

const baseStore = useBaseStore()
const messageStore = useMessageStore()
const dialogVisible = ref(false)

// 背景色
const backgroundColor = ref(baseStore.builder.backgroundColor)

// 处理背景色变化
const handleBackgroundColorChange = (color) => {
  backgroundColor.value = color
}

// 保存设置
const saveSettings = () => {
  try {
    // 更新 store 中的设置
    baseStore.builder.backgroundColor = backgroundColor.value
    baseStore.updateBackgroundElements()
    messageStore.success('设置已保存')
    dialogVisible.value = false
  } catch (error) {
    console.error('保存设置失败:', error)
    messageStore.error('保存设置失败')
  }
}

// 打开对话框
const openDialog = () => {
  // 初始化值
  backgroundColor.value = baseStore.builder.backgroundColor
  dialogVisible.value = true
}

// 暴露方法
defineExpose({
  openDialog
})
</script>

<style scoped>
.settings-container {
  padding: 20px;
}

.setting-item {
  margin-bottom: 24px;
  display: flex;
  align-items: center;
}

.setting-label {
  width: 120px;
  font-size: 14px;
  color: #333;
}

.setting-control {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
}

.color-value {
  font-size: 14px;
  color: #666;
  font-family: monospace;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>

<template>
  <nav class="app-menu">
    <div class="menu-container">
      <el-menu
        :default-active="activeMenu"
        mode="horizontal"
        @select="handleSelect"
        class="menu-list"
      >
        <!-- Actions 分组及其子项 -->
        <el-sub-menu index="actions">
          <template #title>
            <el-icon><Operation /></el-icon>
            <span>Actions</span>
          </template>
          <el-menu-item index="actions/build" @click="handleBuild">
            <el-icon><Box /></el-icon>
            <span>Build</span>
          </el-menu-item>
          <el-menu-item index="actions/save" @click="handleSave">
            <el-icon><Upload /></el-icon>
            <span>Save</span>
          </el-menu-item>
          <el-menu-item index="actions/screenshot" @click="handleScreenshot">
            <el-icon><Picture /></el-icon>
            <span>Screenshot</span>
          </el-menu-item>
          <!-- 加个分隔线 -->
          <el-divider direction="horizontal" class="menu-sub-divider" />
          <!-- 属性 -->
          <el-menu-item index="actions/properties">
            <el-icon><Setting /></el-icon>
            <span>App Properties</span>
          </el-menu-item>
        </el-sub-menu>

        <!-- 其他主菜单项 -->
        <el-menu-item index="edit">
          <el-icon><Edit /></el-icon>
          <span>Edit</span>
        </el-menu-item>
        <el-menu-item index="view">
          <el-icon><View /></el-icon>
          <span>View</span>
        </el-menu-item>

        <!-- 分隔线 -->
        <el-divider direction="vertical" class="menu-divider" />

        <!-- 时间分组及其子项 -->
        <el-sub-menu index="time">
          <template #title>
            <el-icon><Timer /></el-icon>
            <span>Time</span>
          </template>
          
          <!-- Time 分组 -->
          <div class="menu-group">
            <div class="menu-group-title">Time</div>
            <el-menu-item index="time/hour-minute" @click="handleAddElement('time', 'hh:mm')">
              <el-icon><Clock /></el-icon>
              <span>hour:minute</span>
            </el-menu-item>
            <el-menu-item index="time/second">
              <el-icon><Clock /></el-icon>
              <span>second</span>
            </el-menu-item>
            <el-menu-item index="time/hour-minute-ampm">
              <el-icon><Clock /></el-icon>
              <span>hour:minute am/pm</span>
            </el-menu-item>
          </div>
          
          <!-- Date 分组 -->
          
          <div class="menu-group">
            <div class="menu-group-title">Date</div>
            <el-menu-item index="time/weekday-month-day">
              <el-icon><Calendar /></el-icon>
              <span>weekday month day</span>
            </el-menu-item>
            <el-menu-item index="time/month-day">
              <el-icon><Calendar /></el-icon>
              <span>month day</span>
            </el-menu-item>
            <el-menu-item index="time/month-slash-day">
              <el-icon><Calendar /></el-icon>
              <span>month/day</span>
            </el-menu-item>
            <el-menu-item index="time/iso-week">
              <el-icon><Calendar /></el-icon>
              <span>ISO week number</span>
            </el-menu-item>
          </div>
          
          <!-- Analog 分组 -->
          <div class="menu-group">
            <div class="menu-group-title">Analog</div>
            <el-menu-item index="time/analog-hands">
              <el-icon><Watch /></el-icon>
              <span>hour/minute/second hands</span>
            </el-menu-item>
            <el-menu-item index="time/image-hour">
              <el-icon><Watch /></el-icon>
              <span>image 12-hour hand</span>
            </el-menu-item>
            <el-menu-item index="time/image-minute">
              <el-icon><Watch /></el-icon>
              <span>image minute hand</span>
            </el-menu-item>
            <el-menu-item index="time/image-second">
              <el-icon><Watch /></el-icon>
              <span>image second hand</span>
            </el-menu-item>
            <el-menu-item index="time/svg-hour">
              <el-icon><Watch /></el-icon>
              <span>svg hour hand</span>
            </el-menu-item>
            <el-menu-item index="time/svg-minute">
              <el-icon><Watch /></el-icon>
              <span>svg minute hand</span>
            </el-menu-item>
            <el-menu-item index="time/svg-second">
              <el-icon><Watch /></el-icon>
              <span>svg second hand</span>
            </el-menu-item>
          </div>
        </el-sub-menu>

        <el-menu-item index="datafield">
          <el-icon><DataLine /></el-icon>
          <span>DataField</span>
        </el-menu-item>
        <el-menu-item index="goal">
          <el-icon><Aim /></el-icon>
          <span>Goal</span>
        </el-menu-item>
        <el-menu-item index="chart">
          <el-icon><TrendCharts /></el-icon>
          <span>Chart</span>
        </el-menu-item>
        <el-menu-item index="shape">
          <el-icon><Stamp /></el-icon>
          <span>Shape</span>
        </el-menu-item>
        <el-menu-item index="image">
          <el-icon><Picture /></el-icon>
          <span>Image</span>
        </el-menu-item>
        <el-menu-item index="help">
          <el-icon><QuestionFilled /></el-icon>
          <span>Help</span>
        </el-menu-item>
      </el-menu>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBaseStore } from '@/stores/baseStore'
import { useExportStore } from '@/stores/exportStore'
import { useMessageStore } from '@/stores/message'
import { useTimeStore } from '@/stores/elements/timeElement'
import {
  Operation,
  Edit,
  View,
  Timer,
  DataLine,
  Aim,
  TrendCharts,
  Stamp,
  Picture,
  QuestionFilled,
  Box,
  Upload,
  Setting,
  Clock,
  Calendar,
  Watch
} from '@element-plus/icons-vue'
import { elementConfigs } from '@/config/elements'
const route = useRoute()
const router = useRouter()
const baseStore = useBaseStore()
const exportStore = useExportStore()
const messageStore = useMessageStore()
const timeStore = useTimeStore()
const activeMenu = computed(() => {
  return route.path
})
// 计算属性
const watchFaceName = computed(() => {
  return baseStore.watchFaceName
})

// 添加元素
const handleAddElement = (category, type) => {
  console.log('Add Element:', category, type)
  if (category === 'time') {
    const config = elementConfigs.time['time']
    timeStore.addElement(config)
  }
}

// 选择菜单
const handleSelect = (key) => {
  // 这里可以根据需要处理菜单项的点击事件
  console.log('Selected:', key)
}

// 构建
const handleBuild = async () => {
  console.log('Build')
  messageStore.warning('暂不支持！')
}

// 截图
const handleScreenshot = async () => {
  baseStore.deactivateObject()
  try {
    const dataURL = await baseStore.captureScreenshot()
    if (!dataURL) {
      throw new Error('截图数据为空')
    }
    if (!watchFaceName.value) {
      throw new Error('手表名称不能为空')
    }
    const link = document.createElement('a')
    const filename = `${watchFaceName.value}.png`
    link.href = dataURL
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    messageStore.success('截图已保存')
  } catch (error) {
    console.error('截图保存失败:', error)
    messageStore.error('截图保存失败')
  }
}

// 保存
const handleSave =async () => {
  console.log('Save')
  baseStore.deactivateObject()
  try {
    await exportStore.uploadApp()
    // 上传成功后跳转到设计列表
    router.push({
      path: '/designs'
    })
  } catch (error) {
    console.error('上传失败:', error)
    messageStore.error('上传失败: ' + (error.message || '未知错误'))
  }
}
</script>

<style scoped>
.app-menu {
  background-color: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color-light);
}

.menu-container {
  padding: 0 20px;
}

.menu-list {
  border-bottom: none;
  justify-content: flex-start !important; /* 强制靠左对齐 */
}

.menu-divider {
  height: 20px;
  margin: 15px 12px;
  border-left: 1px solid var(--el-border-color-lighter);
}
.menu-sub-divider {
  height: 2px;
  border-left: 1px solid var(--el-border-color-lighter);
}

:deep(.el-menu-item) {
  display: flex;
  align-items: center;
  gap: 4px;
  height: 50px;
  padding: 0 16px;
}

:deep(.el-sub-menu__title) {
  height: 50px;
  line-height: 50px;
}

:deep(.el-icon) {
  margin-right: 4px;
}

/* 子菜单样式 */
:deep(.el-sub-menu .el-menu-item) {
  height: 40px;
  line-height: 40px;
  min-width: 160px;
}

:deep(.el-sub-menu .el-menu--popup) {
  min-width: 160px;
}

/* 移除最大宽度限制 */
.menu-container {
  max-width: none;
}

/* 确保菜单项不会被压缩 */
:deep(.el-menu--horizontal) {
  flex-wrap: nowrap;
  overflow-x: auto;
}

/* 隐藏滚动条但保持功能 */
:deep(.el-menu--horizontal::-webkit-scrollbar) {
  display: none;
}

/* 确保分隔线在菜单中垂直居中 */
:deep(.el-divider--vertical) {
  display: inline-flex;
  align-self: center;
}

/* 添加新的分组样式 */
:deep(.menu-group) {
  background-color: var(--el-fill-color-lighter);
  margin: 4px 0;
  padding: 8px 0;
}

:deep(.menu-group-title) {
  padding: 8px 16px;
  font-size: 14px;
  color: var(--el-text-color-secondary);
  font-weight: 500;
}

:deep(.el-sub-menu .el-menu-item) {
  height: 36px;
  line-height: 36px;
  padding: 0 16px;
}

:deep(.el-menu-item .el-icon) {
  margin-right: 8px;
}
</style> 
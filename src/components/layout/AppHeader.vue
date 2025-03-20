<template>
  <header class="app-header">
    <div class="header-left">
      <h1>Face Studio</h1>
      <nav class="header-nav">
        <a @click="showDesignerConfirm" class="nav-link">
          <Icon icon="material-symbols:edit-square" />
          设计器
        </a>
        <el-dialog v-model="designerDialogVisible" title="提示" width="30%">
          <span>关闭当前操作，并打开新的设计？</span>
          <template #footer>
            <span class="dialog-footer">
              <el-button @click="designerDialogVisible = false">取消</el-button>
              <el-button type="primary" @click="confirmNewDesign">确定</el-button>
            </span>
          </template>
        </el-dialog>
        <a @click="showDesignsListConfirm" class="nav-link">
          <Icon icon="material-symbols:list" />
          我的设计
        </a>
        <el-dialog v-model="designsListDialogVisible" title="提示" width="30%">
          <span>关闭当前操作，并打开设计列表？</span>
          <template #footer>
            <span class="dialog-footer">
              <el-button @click="designsListDialogVisible = false">取消</el-button>
              <el-button type="primary" @click="confirmOpenDesignsList">确定</el-button>
            </span>
          </template>
        </el-dialog>
      </nav>
    </div>

    <div class="app-info" v-if="route.path === '/design'">
      <el-input 
        type="text" 
        v-model="watchFaceName" 
        placeholder="表盘名称" 
        :input-style="{ border: 'none', background: 'transparent' }" 
      />
      <el-input 
        type="text" 
        v-model="kpayId" 
        placeholder="KPAY" 
        :input-style="{ border: 'none', background: 'transparent' }" 
      />
    </div>

    <div class="actions" v-if="route.path === '/design'">
      <button class="action-btn" @click="handleScreenshot">截图</button>
      <button class="action-btn" @click="handleUpload">上传</button>
    </div>

    <div class="user-menu" @click="toggleDropdown" v-if="authStore.isAuthenticated">
      <div class="user-avatar">
        <div class="avatar-circle" :style="{ backgroundColor: avatarColor }">
          {{ userInitials }}
        </div>
        <el-tooltip 
          :content="authStore.user.username"
          :disabled="!isUsernameTruncated"
          placement="bottom"
        >
          <span class="username" ref="usernameRef">
            {{ truncatedUsername }}
          </span>
        </el-tooltip>
      </div>
      <div class="dropdown-menu" v-if="showDropdown">
        <div class="dropdown-item" @click="router.push('/fonts')">
          <Icon icon="material-symbols:font-download-outline" />
          字体预览
        </div>
        <div class="dropdown-item" @click="router.push('/FAQ')">
          <Icon icon="material-symbols:help-outline" />
          帮助中心
        </div>
        <div class="dropdown-divider"></div>
        <div class="dropdown-item" @click="handleLogout">
          <Icon icon="material-symbols:logout" />
          退出登录
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useBaseStore } from '@/stores/baseStore'
import { useAuthStore } from '@/stores/auth'
import { useMessageStore } from '@/stores/message'

const props = defineProps({
  exportPanelRef: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update:isDialogVisible'])

const router = useRouter()
const route = useRoute()
const baseStore = useBaseStore()
const authStore = useAuthStore()
const messageStore = useMessageStore()

const showDropdown = ref(false)
const designerDialogVisible = ref(false)
const designsListDialogVisible = ref(false)
const usernameRef = ref(null)
const isUsernameTruncated = ref(false)

// 计算属性
const watchFaceName = computed({
  get: () => baseStore.watchFaceName,
  set: (value) => baseStore.setWatchFaceName(value)
})

const kpayId = computed({
  get: () => baseStore.kpayId,
  set: (value) => baseStore.setKpayId(value)
})

const userInitials = computed(() => {
  const username = authStore.user.username || ''
  return username
    .split(/\s+/)
    .slice(0, 2)
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    || username.charAt(0).toUpperCase()
})

const avatarColor = computed(() => {
  const colors = [
    '#f56a00', '#7265e6', '#ffbf00', '#00a2ae',
    '#712fd1', '#f74584', '#13c2c2', '#6f42c1'
  ]
  const username = authStore.user.username || ''
  const index = Array.from(username).reduce(
    (acc, char) => acc + char.charCodeAt(0), 0
  ) % colors.length
  return colors[index]
})

const truncatedUsername = computed(() => {
  const username = authStore.user.username || ''
  const maxLength = 12
  if (username.length <= maxLength) return username
  return `${username.slice(0, maxLength)}...`
})

// 方法
const deactivateObject = () => {
  if (baseStore.canvas.getActiveObjects().length > 0) {
    for (const object of baseStore.canvas.getActiveObjects()) {
      baseStore.canvas.discardActiveObject()
    }
  }
}

const showDesignerConfirm = () => {
  designerDialogVisible.value = true
}

const showDesignsListConfirm = () => {
  designsListDialogVisible.value = true
}

const confirmNewDesign = () => {
  designerDialogVisible.value = false
  baseStore.$reset()
  router.push({
    path: '/design',
    query: { new: Date.now().toString() }
  })
}

const confirmOpenDesignsList = () => {
  designsListDialogVisible.value = false
  baseStore.$reset()
  router.push('/designs')
}

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value
}

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}

const handleScreenshot = async () => {
  deactivateObject()
  try {
    const dataURL = await baseStore.captureScreenshot()
    if (!dataURL) {
      throw new Error('截图数据为空')
    }
    const link = document.createElement('a')
    const filename = watchFaceName.value ? `${watchFaceName.value}.png` : 'watch-face.png'
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

const handleUpload = async () => {
  deactivateObject()
  if (props.exportPanelRef) {
    await props.exportPanelRef.uploadApp()
  }
}

// 生命周期钩子
onMounted(() => {
  const checkTruncation = () => {
    if (!usernameRef.value) return
    const element = usernameRef.value
    isUsernameTruncated.value = element.scrollWidth > element.clientWidth
  }

  const closeDropdown = (e) => {
    if (!e.target.closest('.user-menu')) {
      showDropdown.value = false
    }
  }

  checkTruncation()
  window.addEventListener('resize', checkTruncation)
  window.addEventListener('click', closeDropdown)

  onUnmounted(() => {
    window.removeEventListener('resize', checkTruncation)
    window.removeEventListener('click', closeDropdown)
  })
})
</script>

<style scoped>
/* 将原有的样式复制过来 */
.app-header {
  height: 60px;
  background: #fff;
  border-bottom: 1px solid #eee;
  display: flex;
  align-items: center;
  padding: 0 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

/* ... 其他样式保持不变 ... */
</style> 
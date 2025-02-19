<template>
  <div class="app-container">
    <header class="app-header">
      <div class="header-left">
        <h1>Wonder Facer</h1>
        <nav class="header-nav">
          <router-link to="/design" class="nav-link">
            <Icon icon="material-symbols:edit-square" />
            设计器
          </router-link>
          <router-link to="/designs" class="nav-link">
            <Icon icon="material-symbols:list" />
            我的设计
          </router-link>
        </nav>
      </div>
      <div class="app-info" v-if="$route.path === '/design'">
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
      <div class="actions">
        <button class="action-btn" @click="handleDownload">下载</button>
        <button class="action-btn" @click="toggleExportPanel">预览</button>
        <button class="action-btn" @click="handleUpload">上传</button>
      </div>
      <div class="user-menu" @click="toggleDropdown" v-if="authStore.isAuthenticated">
        <div class="user-avatar">
          <Icon icon="material-symbols:account-circle" width="24" />
          <span class="username">{{ authStore.user.username }}</span>
        </div>
        <div class="dropdown-menu" v-if="showDropdown">
          <div class="dropdown-item" @click="handleLogout">
            <Icon icon="material-symbols:logout" />
            退出登录
          </div>
        </div>
      </div>
    </header>
    <main class="app-main">
      <!-- 主要内容区域 -->
      <div class="app-content">
        <router-view></router-view>
      </div>
      <ExportPanel 
        ref="exportPanelRef"
        :isDialogVisible="isDialogVisible" 
        @update:isDialogVisible="isDialogVisible = $event" 
      />
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useBaseStore } from '@/stores/baseStore'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useMessageStore } from '../stores/message'
import ExportPanel from '@/components/ExportPanel.vue';

const baseStore = useBaseStore()
const router = useRouter()
const route = useRoute()
const messageStore = useMessageStore()
const authStore = useAuthStore()

const isDialogVisible = ref(false)

const exportPanelRef = ref(null);

const watchFaceName = computed({
  get: () => baseStore.watchFaceName,
  set: value => baseStore.setWatchFaceName(value)
})

const kpayId = computed({
  get: () => baseStore.kpayId,
  set: value => baseStore.setKpayId(value)
})

const deactivateObject = () => {
  if (baseStore.canvas.getActiveObjects().length > 0) {
    for (const object of baseStore.canvas.getActiveObjects()) {
      baseStore.canvas.discardActiveObject();
    }
  }
};

const toggleExportPanel = () => {
  deactivateObject();
  isDialogVisible.value = !isDialogVisible.value;
};

const showDropdown = ref(false);

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value;
};

const closeDropdown = (e) => {
  if (!e.target.closest('.user-menu')) {
    showDropdown.value = false;
  }
};

window.addEventListener('click', closeDropdown);

const handleLogout = () => {
  authStore.logout();

  router.push('/login');
};

const handleDownload = () => {
  deactivateObject();
  if (exportPanelRef.value) {
    exportPanelRef.value.dowloadConfig();
  }
};
const handleUpload = async () => {
  deactivateObject();
  if (exportPanelRef.value) {
    await exportPanelRef.value.uploadApp();
  }
};
</script>

<style scoped>
.app-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  height: 60px;
  background: #fff;
  border-bottom: 1px solid #eee;
  display: flex;
  align-items: center;
  padding: 0 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 24px;
}

.header-nav {
  display: flex;
  gap: 16px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  color: #666;
  text-decoration: none;
  border-radius: 4px;
  transition: all 0.3s;
}

.nav-link:hover {
  color: #333;
  background-color: #f5f5f5;
}

.nav-link.router-link-active {
  color: #1890ff;
  background-color: #e6f7ff;
}

.nav {
  margin-left: 40px;
  display: flex;
  gap: 20px;
}

.nav-item {
  color: #666;
  text-decoration: none;
  padding: 5px 10px;
  border-radius: 4px;
}

.nav-item:hover,
.nav-item.router-link-active {
  color: #1890ff;
  background: #e6f7ff;
}

.actions {
  margin-left: auto;
  display: flex;
  gap: 10px;
}

.action-btn {
  padding: 6px 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #f5f5f5;
  border-color: #1890ff;
  color: #1890ff;
}

.app-main {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.app-content {
  flex: 1;
  overflow-y: auto;
}

.app-settings {
  width: 200px;
  background-color: #f5f5f5;
  padding: 20px;
  border-left: 1px solid #ddd;
}

.app-info {
  display: flex;
  gap: 12px;
  align-items: center;
}

.info-item {
  width: 150px;
}

:deep(.el-input__inner) {
  height: 32px;
  color: #666;
}

:deep(.el-input__inner::placeholder) {
  color: #999;
}

.user-menu {
  position: relative;
  cursor: pointer;
}

.user-avatar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.user-avatar:hover {
  background-color: #f5f5f5;
}

.username {
  font-size: 14px;
  color: #333;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 4px;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  min-width: 120px;
  z-index: 1000;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  color: #333;
  transition: background-color 0.2s;
}

.dropdown-item:hover {
  background-color: #f5f5f5;
}
</style>
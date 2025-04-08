<template>
  <div class="design-list">
    <div class="header">
      <div class="header-left">
        <div class="icon-buttons">
          <el-tooltip content="系统推荐模板" placement="bottom">
            <el-button 
              class="icon-btn"
              :class="{ 'is-active': isTemplatesRoute }"
              @click="navigateTo('design-templates')"
            >
              <el-icon><Star /></el-icon>
            </el-button>
          </el-tooltip>
          
          <el-tooltip content="我的收藏" placement="bottom">
            <el-button 
              class="icon-btn"
              :class="{ 'is-active': isFavoritesRoute }"
              @click="navigateTo('favorite-designs')"
            >
              <el-icon><Collection /></el-icon>
            </el-button>
          </el-tooltip>
        </div>
        <h2 
          :class="{ 'active': isMyDesignsRoute }" 
          @click="navigateTo('my-designs')"
        >
          我的设计
        </h2>
      </div>
      
      <!-- 根据路由显示不同的操作栏 -->
      <div class="header-right">
        <template v-if="isMyDesignsRoute">
          <!-- 我的设计的搜索和筛选组件 -->
          <el-input v-model="searchName" placeholder="搜索名称" class="name-filter" clearable
            @keyup.enter="handleSearch" />
          <el-select v-model="selectedStatus" placeholder="选择状态" class="status-filter">
            <el-option label="全部" value="" />
            <el-option label="草稿" value="draft" />
            <el-option label="已提交" value="submitted" />
          </el-select>
          <el-select v-model="selectedUserId" placeholder="选择用户" clearable class="user-filter" @change="handleUserChange">
            <el-option v-for="user in usersList" :key="user.id" :label="user.username" :value="user.id">
              <span>{{ user.username }}</span>
              <span class="user-email">({{ user.email }})</span>
            </el-option>
          </el-select>
          <el-select v-model="sortField" placeholder="排序字段" @change="handleSortChange" class="sort-field-filter">
            <el-option label="创建时间" value="createdAt" />
            <el-option label="更新时间" value="updatedAt" />
          </el-select>
          <el-select v-model="sortOrder" placeholder="排序方式" @change="handleSortChange" class="sort-order-filter">
            <el-option label="升序" value="asc" />
            <el-option label="降序" value="desc" />
          </el-select>
          <el-button type="primary" @click="handleSearch">
            <Icon icon="material-symbols:search" />
            搜索
          </el-button>
        </template>
      </div>
    </div>

    <!-- 使用 keep-alive 包裹 router-view -->
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <keep-alive>
          <component 
            :is="Component" 
            :key="$route.fullPath"
            :search-params="{
              userId: selectedUserId || user.id,
              status: selectedStatus,
              name: searchName,
              sortField: sortField,
              sortOrder: sortOrder
            }"
          />
        </keep-alive>
      </transition>
    </router-view>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, defineAsyncComponent, onActivated } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getDesigns, getDesign, updateDesignStatus, updateDesign, deleteDesign } from '@/api/design'
import { useMessageStore } from '@/stores/message'
import { useBaseStore } from '@/stores/baseStore'
import { useAuthStore } from '@/stores/auth'
import dayjs from 'dayjs'
import { getUsers } from '@/api/users'
import { createOrUpdateDesign } from '@/api/design'
import { Star, Collection } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const messageStore = useMessageStore()
const baseStore = useBaseStore()
const authStore = useAuthStore()
const designs = ref([])
const deleteDialogVisible = ref(false)
const editDialogVisible = ref(false)
const designToDelete = ref(null)
const selectedStatus = ref('') // 默认显示草稿状态
const searchName = ref('') // 搜索名称
const sortField = ref('updatedAt')
const sortOrder = ref('desc')
const users = ref({}) // 用于存储用户信息的映射

const user = computed(() => authStore.user)

// 添加用户列表状态
const usersList = ref([])
const selectedUserId = ref(null)

// 编辑表单数据
const editForm = ref({
  id: null,
  name: '',
  kpayId: '',
  designStatus: '',
  description: '',
  configJson: {},
  configJsonString: ''
})
// 分页相关
const currentPage = ref(1)
const pageSize = ref(36)
const total = ref(0)

// 计算当前路由状态
const isMyDesignsRoute = computed(() => route.name === 'my-designs')
const isTemplatesRoute = computed(() => route.name === 'design-templates')
const isFavoritesRoute = computed(() => route.name === 'favorite-designs')

// 获取用户列表
const fetchUsers = async () => {
  try {
    const response = await getUsers()
    usersList.value = response.data
  } catch (error) {
    console.error('获取用户列表失败:', error)
    messageStore.error('获取用户列表失败')
  }
}
// 获取设计列表
const fetchDesigns = async () => {
  try {
    const response = await getDesigns({
      page: currentPage.value,
      pageSize: pageSize.value,
      userId: selectedUserId.value || user.value.id,
      status: selectedStatus.value,
      name: searchName.value,
      sort: `${sortField.value}:${sortOrder.value}`
    })
    
    designs.value = response.data
    total.value = response.meta.pagination.total

    // 提取所有设计的用户ID并去重
    const userIdSet = new Set(
      designs.value
        .map(design => design.userId)
        .filter(id => id) // 过滤掉空值
    )
    const uniqueUserIds = Array.from(userIdSet)

    // 加载用户信息
    if (uniqueUserIds.length > 0) {
      const usersData = await getUsers(uniqueUserIds)
      // 转换为ID映射
      users.value = usersData.reduce((acc, user) => {
        acc[user.id] = user.value
        return acc
      }, {})
    }
  } catch (error) {
    console.error('[DesignList] fetchDesigns error:', error)
    messageStore.error('获取设计列表失败')
  }
}

// 处理页码变化
const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchDesigns()
}

// 处理每页数量变化
const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1 // 重置到第一页
  fetchDesigns()
}

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1 // 重置到第一页
  fetchDesigns()
}

// 处理状态变化
const handleStatusChange = () => {
  currentPage.value = 1 // 重置到第一页
  fetchDesigns()
}
// 处理用户选择变化
const handleUserChange = () => {
  currentPage.value = 1 // 重置到第一页
  fetchDesigns()
}

// 处理排序变化
const handleSortChange = () => {
  currentPage.value = 1 // 重置到第一页
  fetchDesigns()
}

// 格式化日期
const formatDate = (date) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    draft: '草稿',
    submitted: '已提交'
  }
  return statusMap[status] || '未知'
}

// 新建设计
const createNew = () => {
  router.push('/')
}

// 打开画布编辑器
const openCanvas = async (design) => {
  try {
    const response = await getDesign(design.documentId)
    const designData = response.data

    // 设置基础信息
    baseStore.watchFaceName = designData.name
    baseStore.kpayId = designData.kpayId

    // 解析并设置元素配置
    if (designData.configJson) {
      baseStore.elements = designData.configJson
    }

    // 导航到设计页面
    router.push('/design?id=' + designData.documentId)
  } catch (error) {
    console.error('加载设计失败:', error)
    messageStore.error('加载设计失败')
  }
}

// 编辑基本信息
const editDesign = async (design) => {
  try {
    const response = await getDesign(design.documentId)
    const designData = response.data
    // 设置编辑表单数据
    editForm.value.id = designData.id
    editForm.value.name = designData.name
    editForm.value.kpayId = designData.kpayId
    editForm.value.designStatus = designData.designStatus
    editForm.value.description = designData.description
    editForm.value.configJson = designData.configJson
    editForm.value.configJsonString = JSON.stringify(designData.configJson, null, 2)

    editDialogVisible.value = true
  } catch (error) {
    console.error('加载设计失败:', error)
    messageStore.error('加载设计失败')
  }
}

// 确认删除
const confirmDelete = (design) => {
  designToDelete.value = design
  deleteDialogVisible.value = true
}

// 提交设计
const submitDesign = async (design) => {
  try {
    await updateDesignStatus(design.id, 'submitted')
    messageStore.success('提交成功')
    await fetchDesigns() // 刷新列表
  } catch (error) {
    console.error('提交失败:', error)
    messageStore.error('提交失败')
  }
}

// 删除设计
const confirmDeleteDesign = async () => {
  if (!designToDelete.value) return

  try {
    await deleteDesign(designToDelete.value.documentId)
    messageStore.success('删除成功')
    deleteDialogVisible.value = false
    await fetchDesigns() // 刷新列表
  } catch (error) {
    console.error('删除失败:', error)
    messageStore.error('删除失败')
  }
}

// 提交编辑表单
const submitEdit = async () => {
  try {
    // 验证并解析 JSON
    const data = {
      name: editForm.value.name,
      kpayId: editForm.value.kpayId,
      designStatus: editForm.value.designStatus,
      description: editForm.value.description,
      configJson: JSON.parse(editForm.value.configJsonString) // 保存时压缩 JSON
    }
    await updateDesign(editForm.value.id, data)
    messageStore.success('保存成功')
    editDialogVisible.value = false
    await fetchDesigns() // 刷新列表
  } catch (error) {
    if (error instanceof SyntaxError) {
      messageStore.error('JSON 格式错误，请检查配置')
    } else {
      console.error('保存失败:', error)
      messageStore.error('保存失败')
    }
  }
}

// 复制表盘设计
const copyDesign = async (design) => {
  try {
    // 生成新的表盘名称，添加"复制"后缀
    const newName = `${design.name}—copy`

    // 生成新的 kpay ID，确保其唯一性
    const newKpayId = new Date().getTime()

    // 创建新表盘数据
    const newDesignData = {
      name: newName,
      kpayId: newKpayId,
      designStatus: 'draft',
      description: design.description,
      screenshotUrl: design.screenshotUrl,
      configJson: design.configJson,
      userId: design.userId
    }
    
    const response = await createOrUpdateDesign(newDesignData)

    if (response.data) {
      messageStore.success('复制成功')
      // 如果需要刷新列表，可以在这里调用刷新方法
    }
  } catch (error) {
    console.error('复制失败:', error)
    messageStore.error('复制失败')
  }
}

// 获取创作者名称
const getCreatorName = (design) => {
  const userId = design.userId
  if (!userId) return '未知用户'

  const user = users.value[userId]
  if (!user) return '未知用户'

  return user.username || user.nickname || user.email?.split('@')[0] || '未知用户'
}

// 导航方法
const navigateTo = async (routeName) => {
  try {
    await router.push({ 
      name: routeName,
      replace: true
    })
  } catch (error) {
    console.error('[DesignList] navigation error:', error)
    messageStore.error('页面切换失败')
  }
}

// 路由监听
router.afterEach((to, from) => {
  if (to.name === 'my-designs' && from.name !== 'my-designs') {
    fetchDesigns()
  }
})

// 异步导入组件
const MyDesigns = defineAsyncComponent(() => import('./designs/MyDesigns.vue'))
const TemplateList = defineAsyncComponent(() => import('./designs/TemplateList.vue'))

onMounted(() => {
  fetchUsers()
})

onActivated(() => {
})
</script>

<style scoped>
.user-filter {
  width: 200px;
}

.user-email {
  margin-left: 8px;
  color: #909399;
  font-size: 12px;
}

.design-list {
  padding: 0 32px;
  height: calc(100vh - 60px);
  /* 减去顶部导航栏的高度 */
  overflow-y: auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 16px 0;
  border-bottom: 1px solid #ebeef5;
}

.header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.name-filter {
  width: 200px;
}

.username-filter {
  width: 200px;
}

.status-filter {
  width: 120px;
}

.sort-field-filter {
  width: 120px;
}

.sort-order-filter {
  width: 100px;
}

.design-grid {
  margin-bottom: 24px;
}

.design-card {
  margin-bottom: 20px;
  transition: all 0.3s;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .header-left {
    display: flex;
    align-items: center;
    gap: 8px;
  }
}

.title {
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.design-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.description {
  margin: 0;
  color: #666;
  font-size: 14px;
  line-height: 1.5;
}

.meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
  color: #999;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.design-background {
  position: relative;
  width: 100%;
  padding-bottom: 100%;
  /* 创建一个正方形容器 */
  overflow: hidden;
  border-radius: 8px 8px 0 0;
}

.background-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  /* 保持图片比例并填充整个容器 */
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}

.status-tag {
  display: inline-block;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  color: #fff;
}

.status-tag.draft {
  background-color: #909399;
}

.status-tag.submitted {
  background-color: #67c23a;
}

.creator-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  backdrop-filter: blur(3px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  z-index: 2;
}

/* 深色模式适配 */
@media (prefers-color-scheme: dark) {
  .creator-badge {
    background-color: rgba(255, 255, 255, 0.2);
  }
}

.header-left {
  display: flex;
  align-items: center;
  gap: 24px;
}

.icon-buttons {
  display: flex;
  gap: 12px;
}

.icon-btn {
  width: 40px;
  height: 40px;
  padding: 8px;
  border-radius: 8px;
  
  &:hover {
    background-color: var(--el-fill-color-light);
  }
  
  .el-icon {
    font-size: 20px;
  }
}

h2 {
  margin: 0;
  font-size: 24px;
  cursor: pointer;
  color: var(--el-text-color-regular);
  transition: color 0.3s;
  
  &:hover {
    color: var(--el-text-color-primary);
  }
  
  &.active {
    color: var(--el-text-color-primary);
    font-weight: 600;
  }
}

/* 深色模式适配 */
@media (prefers-color-scheme: dark) {
  .icon-btn:hover {
    background-color: var(--el-fill-color-dark);
  }
}

/* 添加路由过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 激活状态样式 */
.icon-btn.is-active {
  color: var(--el-color-primary);
  background-color: var(--el-color-primary-light-9);
}
</style>

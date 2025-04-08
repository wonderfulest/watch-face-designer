<template>
  <el-row :gutter="20" class="design-grid">
    <el-col :span="4" v-for="design in designs" :key="design.id">
      <el-card class="design-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <div class="header-left">
              <span class="title">{{ design.name }}</span>
              <div class="status-tag" :class="design.designStatus">
                {{ getStatusText(design.designStatus) }}
              </div>
            </div>
            <div class="actions">
              <el-button-group>
                <el-button 
                  type="primary" 
                  size="small" 
                  link 
                  @click.stop="handleFavorite(design)"
                  :title="'收藏'"
                >
                  <el-icon><Star /></el-icon>
                </el-button>
                <el-button 
                  type="primary" 
                  size="small" 
                  link 
                  @click="editDesign(design)"
                >
                  <el-icon><Edit /></el-icon>
                </el-button>
                <el-button 
                  type="danger" 
                  size="small" 
                  link 
                  @click="confirmDelete(design)"
                >
                  <el-icon><Delete /></el-icon>
                </el-button>
              </el-button-group>
            </div>
          </div>
        </template>
        <div class="design-info">
          <div class="design-background" v-if="design.screenshotUrl">
            <img :src="design.screenshotUrl" :alt="design.name" class="background-image" />
            <div class="creator-badge">
              <span>作者：{{ getCreatorName(design) }}</span>
            </div>
          </div>
          <div class="design-background" v-else-if="design.backgroundUrl">
            <img :src="design.backgroundUrl" :alt="design.name" class="background-image" />
            <div class="creator-badge">
              <span>作者：{{ getCreatorName(design) }}</span>
            </div>
          </div>
          <div class="meta">
            <span>KPay ID: {{ design.kpayId }}</span>
            <span>更新时间: {{ formatDate(design.updatedAt) }}</span>
          </div>
          <div class="actions">
            <el-button type="primary" size="small" @click="openCanvas(design)">编 辑</el-button>
            <el-button type="warning" size="small" @click="copyDesign(design)">复 制</el-button>
            <el-button 
              v-if="design.designStatus === 'draft'" 
              type="success" 
              size="small"
              @click="submitDesign(design)"
            >
              提 交
            </el-button>
          </div>
        </div>
      </el-card>
    </el-col>
  </el-row>

  <!-- 分页组件 -->
  <div class="pagination-container">
    <el-pagination
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :page-sizes="[12, 24, 36, 48]"
      :total="total"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </div>

  <!-- 删除确认对话框 -->
  <el-dialog v-model="deleteDialogVisible" title="确认删除" width="30%">
    <span>确定要删除这个表盘设计吗？此操作不可恢复。</span>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="deleteDialogVisible = false">取消</el-button>
        <el-button type="danger" @click="confirmDeleteDesign">确认删除</el-button>
      </span>
    </template>
  </el-dialog>

  <!-- 编辑对话框 -->
  <el-dialog v-model="editDialogVisible" title="编辑设计" width="60%" :top="'5vh'">
    <el-form :model="editForm" label-width="120px">
      <el-form-item label="名称">
        <el-input v-model="editForm.name" />
      </el-form-item>
      <el-form-item label="KPay ID">
        <el-input v-model="editForm.kpayId" />
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="editForm.designStatus">
          <el-option label="草稿" value="draft" />
          <el-option label="已提交" value="submitted" />
        </el-select>
      </el-form-item>
      <el-form-item label="描述">
        <el-input v-model="editForm.description" type="textarea" :rows="4" />
      </el-form-item>
      <el-form-item label="配置">
        <el-input v-model="editForm.configJsonString" type="textarea" :rows="32" />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitEdit">保存</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, onMounted, watch, onUnmounted, onActivated } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getDesigns, getDesign, updateDesignStatus, updateDesign, deleteDesign } from '@/api/design'
import { useMessageStore } from '@/stores/message'
import { useBaseStore } from '@/stores/baseStore'
import { createOrUpdateDesign } from '@/api/design'
import dayjs from 'dayjs'
import { Star, StarFilled, Edit, Delete } from '@element-plus/icons-vue'
import { addFavorite } from '@/api/favorites'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const messageStore = useMessageStore()
const baseStore = useBaseStore()
const authStore = useAuthStore()

const designs = ref([])
const currentPage = ref(1)
const pageSize = ref(36)
const total = ref(0)
const deleteDialogVisible = ref(false)
const editDialogVisible = ref(false)
const designToDelete = ref(null)

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

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    draft: '草稿',
    submitted: '已提交'
  }
  return statusMap[status] || '未知'
}

// 格式化日期
const formatDate = (date) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

// 获取创作者名称
const getCreatorName = (design) => {
  return design.creator?.username || '未知用户'
}

// 获取设计列表
const fetchDesigns = async () => {
  try {
    const response = await getDesigns({
      page: currentPage.value,
      pageSize: pageSize.value
    })
    designs.value = response.data
    total.value = response.meta.pagination.total
  } catch (error) {
    console.error('获取设计列表失败:', error)
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
  currentPage.value = 1
  fetchDesigns()
}

// 打开画布编辑器
const openCanvas = async (design) => {
  try {
    const response = await getDesign(design.documentId)
    const designData = response.data

    baseStore.watchFaceName = designData.name
    baseStore.kpayId = designData.kpayId

    if (designData.configJson) {
      baseStore.elements = designData.configJson
    }

    router.push('/design?id=' + designData.documentId)
  } catch (error) {
    console.error('加载设计失败:', error)
    messageStore.error('加载设计失败')
  }
}

// 编辑设计信息
const editDesign = async (design) => {
  try {
    const response = await getDesign(design.documentId)
    const designData = response.data
    
    editForm.value = {
      id: designData.id,
      name: designData.name,
      kpayId: designData.kpayId,
      designStatus: designData.designStatus,
      description: designData.description,
      configJson: designData.configJson,
      configJsonString: JSON.stringify(designData.configJson, null, 2)
    }
    
    editDialogVisible.value = true
  } catch (error) {
    console.error('加载设计失败:', error)
    messageStore.error('加载设计失败')
  }
}

// 提交编辑
const submitEdit = async () => {
  try {
    const data = {
      name: editForm.value.name,
      kpayId: editForm.value.kpayId,
      designStatus: editForm.value.designStatus,
      description: editForm.value.description,
      configJson: JSON.parse(editForm.value.configJsonString)
    }
    await updateDesign(editForm.value.id, data)
    messageStore.success('保存成功')
    editDialogVisible.value = false
    await fetchDesigns()
  } catch (error) {
    if (error instanceof SyntaxError) {
      messageStore.error('JSON 格式错误，请检查配置')
    } else {
      console.error('保存失败:', error)
      messageStore.error('保存失败')
    }
  }
}

// 复制设计
const copyDesign = async (design) => {
  try {
    const newDesignData = {
      name: `${design.name}—copy`,
      kpayId: new Date().getTime().toString(),
      designStatus: 'draft',
      description: design.description,
      screenshotUrl: design.screenshotUrl,
      configJson: design.configJson
    }
    
    const response = await createOrUpdateDesign(newDesignData)
    if (response.data) {
      messageStore.success('复制成功')
      await fetchDesigns()
    }
  } catch (error) {
    console.error('复制失败:', error)
    messageStore.error('复制失败')
  }
}

// 确认删除
const confirmDelete = (design) => {
  designToDelete.value = design
  deleteDialogVisible.value = true
}

// 执行删除
const confirmDeleteDesign = async () => {
  if (!designToDelete.value) return

  try {
    await deleteDesign(designToDelete.value.documentId)
    messageStore.success('删除成功')
    deleteDialogVisible.value = false
    await fetchDesigns()
  } catch (error) {
    console.error('删除失败:', error)
    messageStore.error('删除失败')
  }
}

// 提交设计
const submitDesign = async (design) => {
  try {
    await updateDesignStatus(design.id, 'submitted')
    messageStore.success('提交成功')
    await fetchDesigns()
  } catch (error) {
    console.error('提交失败:', error)
    messageStore.error('提交失败')
  }
}

// 处理刷新事件
const handleRefresh = (event) => {
  if (event.detail.route === 'my-designs') {
    currentPage.value = 1
    fetchDesigns()
  }
}

// 首次挂载时加载数据
onMounted(() => {
  fetchDesigns()
})

// 每次组件被激活时重新加载数据
onActivated(() => {
  fetchDesigns()
})

onUnmounted(() => {
  // 清理事件监听
  window.removeEventListener('refresh-list', handleRefresh)
})

// 处理收藏
const handleFavorite = async (design) => {
  try {
    await addFavorite(design.id, authStore.user.id)
    messageStore.success('收藏成功')
  } catch (error) {
    console.error('收藏失败:', error)
    messageStore.error('收藏失败')
  }
}
</script>

<style scoped>
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
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.title {
  font-size: 16px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.status-tag {
  display: inline-block;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  color: #fff;
}

.status-tag.draft {
  background-color: var(--el-color-info);
}

.status-tag.submitted {
  background-color: var(--el-color-success);
}

.design-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.design-background {
  position: relative;
  width: 100%;
  padding-bottom: 100%;
  overflow: hidden;
  border-radius: 8px;
}

.background-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
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
}

.meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}

/* 深色模式适配 */
@media (prefers-color-scheme: dark) {
  .creator-badge {
    background-color: rgba(255, 255, 255, 0.2);
  }
}

.actions .el-button-group {
  display: flex;
  gap: 4px;
}

/* 星星图标悬浮效果 */
.actions .el-button:first-child:hover {
  color: var(--el-color-warning) !important;
}

/* 已收藏状态的星星样式 */
.actions .el-button.is-active {
  color: var(--el-color-warning) !important;
}
</style>

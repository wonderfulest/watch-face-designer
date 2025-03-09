<template>
  <div class="design-list">
    <div class="header">
      <div class="header-left">
        <h2>我的设计</h2>
      </div>
      <div class="header-right">
        <el-input v-model="searchName" placeholder="搜索名称" class="name-filter" clearable @keyup.enter="handleSearch" />
        <el-select v-model="selectedStatus" placeholder="选择状态" @change="handleStatusChange" class="status-filter">
          <el-option label="全部" value="" />
          <el-option label="草稿" value="draft" />
          <el-option label="已提交" value="submitted" />
        </el-select>
        <el-button type="primary" @click="handleSearch">
          <Icon icon="material-symbols:search" />
          搜索
        </el-button>
      </div>
    </div>

    <el-row :gutter="20" class="design-grid">
      <el-col :span="4" v-for="design in designs" :key="design.id">
        <el-card class="design-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <div class="header-left">
                <span class="title">{{ design.attributes.name }}</span>
                <div class="status-tag" :class="design.attributes.status">
                  {{ getStatusText(design.attributes.status) }}
                </div>
              </div>
              <div class="actions">
                <el-button-group>
                  <el-button type="primary" size="small" link @click="editDesign(design)">
                    <Icon icon="material-symbols:edit" />
                  </el-button>
                  <el-button type="danger" size="small" link @click="confirmDelete(design)">
                    <Icon icon="material-symbols:delete" />
                  </el-button>
                </el-button-group>
              </div>
            </div>
          </template>
          <div class="design-info">
            <div class="design-background" v-if="design.attributes.screenshot?.data">
              <img :src="design.attributes.screenshot.data?.attributes?.url" :alt="design.attributes.name" class="background-image" />
            </div>
            <div class="design-background" v-else-if="design.attributes.background?.data">
              <img :src="design.attributes.background.data?.attributes?.url" :alt="design.attributes.name" class="background-image" />
            </div>
            <p class="description">{{ design.attributes.description || '暂无描述' }}</p>
            <div class="meta">
              <span>ID: {{ design.id }}</span>
              <span>KPay ID: {{ design.attributes.kpay_appid }}</span>
              <span>更新时间: {{ formatDate(design.attributes.updatedAt) }}</span>
            </div>
            <div class="actions">
              <el-button type="primary" size="small" @click="openCanvas(design)">编辑</el-button>
              <el-button v-if="design.attributes.status === 'draft'" type="success" size="small" @click="submitDesign(design)">提交</el-button>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 在设计列表后面添加 -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[12, 24, 36, 48]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange" />
    </div>
    <el-dialog v-model="deleteDialogVisible" title="确认删除" width="30%">
      <span>确定要删除这个表盘设计吗？此操作不可恢复。</span>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="deleteDialogVisible = false">取消</el-button>
          <el-button type="danger" @click="deleteDesign">确认删除</el-button>
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
          <el-input v-model="editForm.kpay_appid" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="editForm.status">
            <el-option label="草稿" value="draft" />
            <el-option label="已提交" value="submitted" />
          </el-select>
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="editForm.description" type="textarea" :rows="4" />
        </el-form-item>
        <el-form-item label="配置">
          <el-input v-model="editForm.config_json" type="textarea" :rows="32" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitEdit">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getDesigns, getDesignDetail, updateDesignStatus, updateDesign, deleteDesign as apiDeleteDesign } from '@/api/design'
import { useMessageStore } from '@/stores/message'
import { useBaseStore } from '@/stores/baseStore'
import dayjs from 'dayjs'

const router = useRouter()
const messageStore = useMessageStore()
const baseStore = useBaseStore()
const designs = ref([])
const deleteDialogVisible = ref(false)
const editDialogVisible = ref(false)
const designToDelete = ref(null)
const selectedStatus = ref('draft') // 默认显示草稿状态
const searchName = ref('') // 搜索名称

// 编辑表单数据
const editForm = ref({
  id: null,
  name: '',
  kpay_appid: '',
  status: '',
  description: '',
  config_json: ''
})
// 分页相关
const currentPage = ref(1)
const pageSize = ref(12)
const total = ref(0)

// 获取设计列表
const fetchDesigns = async () => {
  try {
    const userStr = localStorage.getItem('user')
    const user = JSON.parse(userStr)

    const response = await getDesigns({
      page: currentPage.value,
      pageSize: pageSize.value,
      userId: user.id,
      status: selectedStatus.value,
      name: searchName.value
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
    const response = await getDesignDetail(design.id)
    const designData = response.data

    // 设置基础信息
    baseStore.watchFaceName = designData.attributes.name
    baseStore.kpayId = designData.attributes.kpay_appid

    // 解析并设置元素配置
    if (designData.attributes.config_json) {
      baseStore.elements = JSON.parse(designData.attributes.config_json)
    }

    // 导航到设计页面
    router.push('/design?id=' + designData.id)
  } catch (error) {
    console.error('加载设计失败:', error)
    messageStore.error('加载设计失败')
  }
}

// 编辑基本信息
const editDesign = async (design) => {
  try {
    const response = await getDesignDetail(design.id)
    const designData = response.data

    // 设置编辑表单数据
    editForm.value = {
      id: designData.id,
      name: designData.attributes.name,
      kpay_appid: designData.attributes.kpay_appid,
      status: designData.attributes.status,
      description: designData.attributes.description,
      config_json: JSON.stringify(JSON.parse(designData.attributes.config_json), null, 2)
    }

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
const deleteDesign = async () => {
  if (!designToDelete.value) return

  try {
    await apiDeleteDesign(designToDelete.value.id)
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
    const configJson = JSON.parse(editForm.value.config_json)

    const data = {
      name: editForm.value.name,
      kpay_appid: editForm.value.kpay_appid,
      status: editForm.value.status,
      description: editForm.value.description,
      config_json: JSON.stringify(configJson) // 保存时压缩 JSON
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

onMounted(() => {
  fetchDesigns()
})
</script>

<style scoped>
.design-list {
  padding: 24px;
  height: calc(100vh - 60px); /* 减去顶部导航栏的高度 */
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

.status-filter {
  width: 120px;
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
  width: 240px;
  height: 240px;
  margin: 0 auto 12px;
  border-radius: 50%;
  overflow: hidden;
  background-color: #f5f5f5;
  border: 8px solid #333;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.background-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
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
</style>

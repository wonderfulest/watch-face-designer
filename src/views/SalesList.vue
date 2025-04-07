<template>
    <div class="sales-list">
        <div class="header">
            <h2>销售记录</h2>
            <div class="header-actions">
                <el-switch
                    v-model="successOnly"
                    class="mr-4"
                    active-text="仅显示成功"
                    @change="handleSuccessOnlyChange"
                />
                <el-button type="primary" @click="refreshData">
                    <Icon icon="material-symbols:refresh" />
                    刷新
                </el-button>
            </div>
        </div>

        <el-table v-loading="loading" :data="salesData.purchases" style="width: 100%" border>
            <el-table-column prop="reference" label="订单号" width="120" />
            <el-table-column prop="user" label="用户" width="150" />
            <el-table-column prop="creationDate" label="创建时间" width="180">
                <template #default="{ row }">
                {{ formatDateTime(row.creationDate) }}
                </template>
            </el-table-column>
            <el-table-column prop="totalAmount" label="总金额" width="100">
                <template #default="{ row }">
                    ${{ row.totalAmount.toFixed(2) }}
                </template>
            </el-table-column>
            <el-table-column prop="amountServiceFee" label="服务费" width="100">
                <template #default="{ row }">
                    ${{ row.amountServiceFee.toFixed(2) }}
                </template>
            </el-table-column>
            <el-table-column prop="amountToPayOut" label="实付金额" width="100">
                <template #default="{ row }">
                    ${{ row.amountToPayOut.toFixed(2) }}
                </template>
            </el-table-column>
            <el-table-column prop="paymentType" label="支付方式" width="120" />
            <el-table-column prop="status" label="状态" width="100">
                <template #default="{ row }">
                    <el-tag :type="row.payStatus === 'Success' ? 'success' : 'danger'">
                        {{ row.payStatus }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column prop="product" label="产品" width="150" />
            <el-table-column prop="productId" label="产品ID" width="100" />
            <el-table-column label="设计预览" width="120">
                <template #default="{ row }">
                    <div class="design-preview" v-if="row.design?.screenshot">
                        <el-image
                            :src="row.design.screenshot"
                            :preview-src-list="[row.design.screenshot]"
                            fit="cover"
                            class="preview-image"
                            :preview-teleported="true"
                            :initial-index="0"
                        >
                            <template #error>
                                <div class="image-placeholder">暂无预览</div>
                            </template>
                        </el-image>
                    </div>
                    <div class="image-placeholder" v-else>暂无预览</div>
                </template>
            </el-table-column>
            <el-table-column label="设计作者" width="150">
                <template #default="{ row }">
                    <span v-if="row.design?.user ">
                        {{ row.design.user.username }}
                    </span>
                    <span v-else-if="row.kpay_app?.kpay_developer">
                        {{ row.kpay_app.kpay_developer.name }}
                    </span>
                    <span v-else>-</span>
                </template>
            </el-table-column>
            <el-table-column prop="country" label="国家" width="100" />
            <el-table-column prop="platform" label="平台" width="100" />
            <el-table-column prop="device" label="设备" min-width="200" />
        </el-table>

        <div class="pagination">
            <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :total="salesData.total"
                :page-sizes="[10, 20, 50, 100]" layout="total, sizes, prev, pager, next" @size-change="handleSizeChange"
                @current-change="handleCurrentChange" />
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { getSalesHistory } from '@/api/sales'
import { ElMessage } from 'element-plus'

const loading = ref(false)
const salesData = ref({
    total: 0,
    purchases: []
})
const currentPage = ref(1)
const pageSize = ref(20)

const successOnly = ref(true)

const formatDateTime = (dateStr) => {
  if (!dateStr) return ''
  
  // 解析原始时间字符串
  const date = new Date(dateStr.replace(' ', 'T'))
  
  // 添加8小时
  date.setHours(date.getHours() + 8)
  
  // 格式化为本地时间字符串
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).replace(/\//g, '-')
}

const fetchData = async () => {
    loading.value = true
    try {
        const response = await getSalesHistory({
            page: currentPage.value,
            pageSize: pageSize.value
        })
        
        // 使用返回的数据
        salesData.value = {
            total: response.meta.pagination.total,
            purchases: response.data
        }
    } catch (error) {
        ElMessage.error('获取销售记录失败')
    } finally {
        loading.value = false
    }
}

const handleSizeChange = (val) => {
    pageSize.value = val
    currentPage.value = 1  // 切换每页数量时重置到第一页
    fetchData()
}

const handleCurrentChange = (val) => {
    currentPage.value = val
    fetchData()
}

const refreshData = () => {
    fetchData()
}
const handleSuccessOnlyChange = () => {
  currentPage.value = 1 // 切换条件时重置页码
  fetchData()
}

onMounted(() => {
    fetchData()
})
</script>

<style scoped>

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.mr-4 {
  margin-right: 16px;
}
.sales-list {
    padding: 20px;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.header h2 {
    margin: 0;
    font-size: 24px;
    color: #333;
}

.pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
}

:deep(.el-table) {
    margin-top: 20px;
}

:deep(.el-table th) {
    background-color: #f5f7fa;
    color: #606266;
    font-weight: 500;
}

:deep(.el-table td) {
    padding: 12px 0;
}

.design-preview {
  width: 80px;
  height: 80px;
  border-radius: 4px;
  overflow: hidden;
  margin: 0 auto;
  cursor: pointer;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-placeholder {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
  color: #909399;
  font-size: 12px;
  border-radius: 4px;
  margin: 0 auto;
}

:deep(.el-image) {
  width: 100%;
  height: 100%;
}

:deep(.el-image-viewer__wrapper) {
  z-index: 2100;
}

:deep(.el-image-viewer__mask) {
  z-index: 2099;
}
</style>
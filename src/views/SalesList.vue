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
                    <el-tag :type="row.status === 'Success' ? 'success' : 'danger'">
                        {{ row.status }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column prop="product" label="产品" width="150" />
            <el-table-column prop="productId" label="产品ID" width="100" />
            <el-table-column label="设计预览" width="120">
                <template #default="{ row }">
                    <div class="design-preview" v-if="designInfo[row.productId]?.screenshot">
                        <el-image
                            :src="designInfo[row.productId].screenshot"
                            :preview-src-list="[designInfo[row.productId].screenshot]"
                            fit="cover"
                            class="preview-image"
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
                    <span v-if="designInfo[row.productId]">
                        ID: {{ designInfo[row.productId].user_id }}
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
import { getDesignsByProductIds } from '@/api/design'
import { ElMessage } from 'element-plus'

const loading = ref(false)
const salesData = ref({
    total: 0,
    purchases: []
})
const currentPage = ref(1)
const pageSize = ref(20)

const successOnly = ref(true)

// 添加设计信息的响应式引用
const designInfo = ref({}) // 用于存储产品ID到设计信息的映射

// 添加时间格式化函数
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

// 获取设计信息
const fetchDesignInfo = async (purchases) => {
  try {
    const productIds = purchases
      .map(purchase => purchase.productId)
      .filter(id => id)

    if (productIds.length === 0) return

    const response = await getDesignsByProductIds(productIds)
    
    const newDesignInfo = {}
    response.data.forEach(design => {
      if (design.attributes.kpay_product_id) {
        newDesignInfo[design.attributes.kpay_product_id] = {
          user_id: design.attributes.user_id || design.attributes.user?.data?.id,
          name: design.attributes.name,
          screenshot: design.attributes.screenshot?.data?.attributes?.url || null
        }
      }
    })
    
    designInfo.value = newDesignInfo
  } catch (error) {
    console.error('获取设计信息失败:', error)
    ElMessage.error('获取设计信息失败')
  }
}

const fetchData = async () => {
    loading.value = true
    try {
        const start = (currentPage.value - 1) * pageSize.value
        const data = await getSalesHistory({
            start,
            amount: pageSize.value,
            sort: 'desc',
            successOnly: successOnly.value
        })
        salesData.value = data
        
        // 获取设计信息
        await fetchDesignInfo(data.purchases)
    } catch (error) {
        ElMessage.error('获取销售记录失败')
    } finally {
        loading.value = false
    }
}

const handleSizeChange = (val) => {
    pageSize.value = val
    currentPage.value = 1
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
</style>
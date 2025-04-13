<template>
  <el-dialog v-model="dialogVisible" title="编辑设计" width="60%" :top="'5vh'">
    <el-form :model="form" label-width="120px">
      <el-form-item label="名称">
        <el-input v-model="form.name" />
      </el-form-item>
      <el-form-item label="KPay ID">
        <el-input v-model="form.kpayId" />
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="form.designStatus">
          <el-option label="草稿" value="draft" />
          <el-option label="已提交" value="submitted" />
        </el-select>
      </el-form-item>
      <el-form-item label="描述">
        <el-input v-model="form.description" type="textarea" :rows="2" />
      </el-form-item>
      <el-form-item label="配置">
        <div class="json-editor" style="width: 100%; min-width: 800px;">
          <div class="json-toolbar">
            <el-button size="small" @click="copyConfig">
              <el-icon><DocumentCopy /></el-icon>
              复制
            </el-button>
          </div>
          <div class="json-content">
            <vue-json-pretty
              :data="form.configJson"
              :deep="3"
              :showLength="true" 
              :showLineNumber="true"
              :showDoubleQuotes="true"
              :highlightMouseoverNode="true"
              :selectOnClickNode="true"
              :collapsedOnClickBrackets="true"
              style="min-width: 100%;"
            />
          </div>
        </div>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleConfirm">保存</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getDesign, updateDesign } from '@/api/design'
import { useBaseStore } from '@/stores/baseStore'
import { useMessageStore } from '@/stores/message'
import { ElMessageBox } from 'element-plus'
import { createOrUpdateDesign } from '@/api/design'
import { useAuthStore } from '@/stores/auth'
import VueJsonPretty from 'vue-json-pretty'
import 'vue-json-pretty/lib/styles.css'
import { DocumentCopy } from '@element-plus/icons-vue'
import emitter from '@/utils/eventBus'

const dialogVisible = ref(false)
const route = useRoute()
const form = reactive({
  id: null,
  name: '',
  kpayId: '',
  designStatus: '',
  description: '',
  configJson: {},
  configJsonString: ''
})

const baseStore = useBaseStore()
const messageStore = useMessageStore()
const authStore = useAuthStore()
const user = computed(() => authStore.user)

const emit = defineEmits(['success', 'cancel'])

// 加载设计数据
const loadDesign = async (documentId) => {
  try {
    const response = await getDesign(documentId)
    const designData = response.data
    
    // 先设置基本信息
    Object.assign(form, {
      id: designData.id,
      name: designData.name,
      kpayId: designData.kpayId,
      designStatus: designData.designStatus,
      description: designData.description,
      configJson: designData.configJson,
      configJsonString: JSON.stringify(designData.configJson, null, 2)
    })

    // 获取最新配置
    const config = baseStore.generateConfig()
    if (config) {
      form.configJson = config
      form.configJsonString = JSON.stringify(config, null, 2)
    }
  } catch (error) {
    console.error('加载设计失败:', error)
    ElMessage.error('加载设计失败')
    handleCancel()
  }
}

// 保存设计
const handleConfirm = async () => {
  try {
    const config = baseStore.generateConfig()
    if (!config) {
      messageStore.error('生成配置失败')
      return
    }

    const data = {
      name: form.name,
      kpayId: form.kpayId,
      designStatus: form.designStatus,
      description: form.description,
      configJson: JSON.stringify(config),
      userId: user.value.id
    }

    if (form.id) {
      data.documentId = form.id
    }

    const res = await createOrUpdateDesign(data)
    emit('success', res.data)
    dialogVisible.value = false
  } catch (error) {
    console.error('更新设计失败:', error)
    messageStore.error(error.message || '更新设计失败')
  }
}

const handleCancel = () => {
  emit('cancel')
  dialogVisible.value = false
}

// 复制配置到剪贴板
const copyConfig = () => {
  const configStr = JSON.stringify(form.configJson, null, 2)
  navigator.clipboard
    .writeText(configStr)
    .then(() => {
      messageStore.success('配置已复制到剪贴板')
    })
    .catch(() => {
      messageStore.error('复制失败')
    })
}

// 定义 show 方法
const show = async (documentId) => {
  await loadDesign(documentId)
  dialogVisible.value = true
}

// 添加事件监听
const handleOpenViewProperties = () => {
  const designId = route.query.id
  console.log('open-view-properties', designId)
  if (designId) {
    show(designId)
  }
}

onMounted(() => {
  emitter.on('open-view-properties', handleOpenViewProperties)
})

onUnmounted(() => {
  emitter.off('open-view-properties', handleOpenViewProperties)
})

// 暴露方法给父组件
defineExpose({
  show
})
</script>

<style scoped>
.json-editor {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
}

.json-toolbar {
  padding: 8px;
  background-color: #f5f7fa;
  border-bottom: 1px solid #dcdfe6;
}

.json-content {
  width: 100%;
  max-height: 600px;
  overflow: auto;
  padding: 8px;
}

:deep(.vjs-value__string) {
  color: #42b983;
}

:deep(.vjs-value__number) {
  color: #f08d49;
}

:deep(.vjs-value__boolean) {
  color: #cc99cd;
}

:deep(.vjs-key) {
  color: #7f8c8d;
}

:deep(.vjs-tree) {
  margin: 0;
  padding: 0;
  list-style: none;
}

:deep(.vjs-tree__brackets) {
  cursor: pointer;
}

:deep(.vjs-tree__brackets:hover) {
  color: #409eff;
}
</style> 
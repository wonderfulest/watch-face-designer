<template>
  <el-dialog
    v-model="dialogVisible"
    title="WPay接入"
    width="400px"
    :close-on-click-modal="false"
  >
    <el-form :model="form" label-width="120px">
      <el-form-item label="API Token">
        <el-input v-model="form.token" placeholder="请输入WPay商家API Token" />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive } from 'vue'

const dialogVisible = ref(false)
const form = reactive({
  token: ''
})

const emit = defineEmits(['update:modelValue'])

const handleSave = () => {
  if (form.token) {
    localStorage.setItem('wpay_token', form.token)
    dialogVisible.value = false
    form.token = ''
  }
}

defineExpose({
  show: () => {
    dialogVisible.value = true
  }
})
</script>

<style scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style> 
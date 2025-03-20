<template>
  <div class="login-container">
    <div class="login-box">
      <div class="tab-header">
        <button 
          :class="['tab-btn', { active: activeTab === 'login' }]" 
          @click="activeTab = 'login'"
        >
          登录
        </button>
        <button 
          :class="['tab-btn', { active: activeTab === 'register' }]" 
          @click="activeTab = 'register'"
        >
          注册
        </button>
      </div>

      <!-- 登录表单 -->
      <form v-if="activeTab === 'login'" @submit.prevent="handleLogin" class="form">
        <div class="form-item">
          <label for="loginEmail">邮箱</label>
          <el-input
            id="loginEmail"
            v-model="loginForm.email"
            type="email"
            required
            placeholder="请输入邮箱"
          >
            <template #prefix>
              <el-icon><Message /></el-icon>
            </template>
          </el-input>
        </div>
        <div class="form-item">
          <label for="loginPassword">密码</label>
          <el-input
            id="loginPassword"
            v-model="loginForm.password"
            type="password"
            required
            placeholder="请输入密码"
            show-password
          >
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
          </el-input>
        </div>
        <el-button 
          type="primary" 
          native-type="submit"
          :loading="isLoading"
          class="submit-btn"
        >
          {{ isLoading ? '登录中...' : '登录' }}
        </el-button>
      </form>

      <!-- 注册表单 -->
      <form v-else @submit.prevent="handleRegister" class="form">
        <div class="form-item">
          <label for="registerUsername">用户名</label>
          <el-input
            id="registerUsername"
            v-model="registerForm.username"
            required
            placeholder="请输入用户名"
          >
            <template #prefix>
              <el-icon><User /></el-icon>
            </template>
          </el-input>
        </div>
        <div class="form-item">
          <label for="registerEmail">邮箱</label>
          <el-input
            id="registerEmail"
            v-model="registerForm.email"
            type="email"
            required
            placeholder="请输入邮箱"
          >
            <template #prefix>
              <el-icon><Message /></el-icon>
            </template>
          </el-input>
        </div>
        <div class="form-item">
          <label for="registerPassword">密码</label>
          <el-input
            id="registerPassword"
            v-model="registerForm.password"
            type="password"
            required
            placeholder="请输入密码"
            show-password
          >
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
          </el-input>
        </div>
        <div class="form-item">
          <label for="confirmPassword">确认密码</label>
          <el-input
            id="confirmPassword"
            v-model="registerForm.confirmPassword"
            type="password"
            required
            placeholder="请再次输入密码"
            show-password
          >
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
          </el-input>
        </div>
        <el-button 
          type="primary" 
          native-type="submit"
          :loading="isRegistering"
          class="submit-btn"
        >
          {{ isRegistering ? '注册中...' : '注册' }}
        </el-button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useMessageStore } from '@/stores/message'
import { Message, Lock, User } from '@element-plus/icons-vue'
import axios from '@/config/axiosConfig'

const router = useRouter()
const authStore = useAuthStore()
const messageStore = useMessageStore()

const activeTab = ref('login')
const isLoading = ref(false)
const isRegistering = ref(false)

const loginForm = reactive({
  email: '',
  password: ''
})

const registerForm = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const handleLogin = async () => {
  if (isLoading.value) return

  isLoading.value = true
  try {
    await authStore.login(loginForm.email, loginForm.password)
    messageStore.success('登录成功')
    const redirect = router.currentRoute.value.query.redirect || '/'
    router.push(redirect)
  } catch (error) {
    messageStore.error(error.response?.data?.message || '登录失败，请检查邮箱和密码')
  } finally {
    isLoading.value = false
  }
}

const handleRegister = async () => {
  if (isRegistering.value) return
  
  // 表单验证
  if (registerForm.password !== registerForm.confirmPassword) {
    messageStore.error('两次输入的密码不一致')
    return
  }

  if (registerForm.password.length < 6) {
    messageStore.error('密码长度不能少于6位')
    return
  }

  isRegistering.value = true
  try {
    const response = await axios.post('/auth/local/register', {
      username: registerForm.username,
      email: registerForm.email,
      password: registerForm.password
    })

    messageStore.success('注册成功，请登录')
    activeTab.value = 'login'
    loginForm.email = registerForm.email
    // 清空注册表单
    Object.keys(registerForm).forEach(key => registerForm[key] = '')
  } catch (error) {
    const errorMessage = error.response?.data?.error?.message || '注册失败，请稍后重试'
    messageStore.error(errorMessage)
  } finally {
    isRegistering.value = false
  }
}
</script>

<style scoped>
.login-container {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  background-image: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.login-box {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 420px;
}

.tab-header {
  display: flex;
  margin-bottom: 2rem;
  border-bottom: 1px solid #eee;
}

.tab-btn {
  flex: 1;
  padding: 1rem;
  background: none;
  border: none;
  font-size: 1.1rem;
  color: #666;
  cursor: pointer;
  transition: all 0.3s;
}

.tab-btn.active {
  color: var(--el-color-primary);
  border-bottom: 2px solid var(--el-color-primary);
}

.form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-item label {
  color: #666;
  font-size: 0.9rem;
  margin-left: 0.2rem;
}

.submit-btn {
  margin-top: 1rem;
  height: 40px;
  font-size: 1rem;
}

:deep(.el-input__wrapper) {
  box-shadow: 0 0 0 1px #dcdfe6 inset;
}

:deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px var(--el-color-primary) inset;
}

:deep(.el-input__inner) {
  height: 40px;
}
</style>

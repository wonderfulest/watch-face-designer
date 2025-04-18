import { defineStore } from 'pinia'
import { login } from '@/api/auth'
import axiosInstance from '@/config/axiosConfigV5'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    user: JSON.parse(localStorage.getItem('user') || '{}')
  }),

  getters: {
    isAuthenticated: (state) => !!state.token
  },

  actions: {
    async login(username, password) {
      try {
        const response = await login(username, password)

        const { jwt, user } = response
        this.token = jwt
        this.user = user

        localStorage.setItem('token', jwt)
        localStorage.setItem('user', JSON.stringify(user))

        // 设置 axios 请求头
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${jwt}`

        return true
      } catch (error) {
        console.error('Login failed:', error)
        throw error
      }
    },

    logout() {
      this.token = ''
      this.user = {}
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      delete axiosInstance.defaults.headers.common['Authorization']
    },

    // 检查并恢复登录状态
    initAuth() {
      const token = localStorage.getItem('token')
      if (token) {
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`
      }
    }
  }
})

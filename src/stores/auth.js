import { defineStore } from 'pinia'
import { login } from '@/api/auth'
import axiosInstance from '@/config/axiosConfigV5'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: '',
    user: {}
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
      delete axiosInstance.defaults.headers.common['Authorization']
    },
  },
  persist: true
})

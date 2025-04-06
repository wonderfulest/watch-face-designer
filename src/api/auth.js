import axiosInstance from '@/config/axiosConfigV5'

/**
 * 注册
 * @param {string} username - 用户名
 * @param {string} email - 邮箱
 * @param {string} password - 密码
 * @returns {Promise} 用户列表数据
 */
export const register = async (username, email, password) => {
  const response = await axiosInstance.post('/auth/local/register', {
    username,
    email,
    password
  })
  return response.data
}

/**
 * 登录
 * @param {string} username - 用户名
 * @param {string} password - 密码
 * @returns {Promise} 用户列表数据
 */
export const login = async (username, password) => {
  const response = await axiosInstance.post('/auth/local', {
    identifier: username,
    password: password
  })
  return response.data
}
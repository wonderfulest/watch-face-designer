import axiosInstance from '@/config/axiosConfigV5'

/**
 * 获取用户列表
 * @param {Array} userIds - 用户ID数组
 * @returns {Promise} 用户列表数据
 */
export const getUsers = async (userIds) => {
  // 创建查询参数对象
  const params = {
    'pagination[pageSize]': 100,
    'populate': '*'
  }

  // 如果有用户ID，使用正确的格式添加过滤条件
  if (userIds && userIds.length > 0) {
    userIds.forEach((id, index) => {
      params[`filters[id][$in][${index}]`] = id
    })
  }
  
  const response = await axiosInstance.get('/users', { params })
  return response.data || []
}
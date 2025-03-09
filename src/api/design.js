import axiosInstance from '@/config/axiosConfig'

/**
 * 获取设计列表
 * @param {Object} params - 查询参数
 * @param {number} params.page - 当前页码
 * @param {number} params.pageSize - 每页数量
 * @param {string} params.userId - 用户ID
 * @param {string} params.status - 状态筛选
 * @param {string} params.name - 名称筛选
 * @returns {Promise} 设计列表数据
 */
export const getDesigns = async ({ page, pageSize, userId, status, name }) => {
  const params = {
    'pagination[page]': page,
    'pagination[pageSize]': pageSize,
    'filters[user_id][$eq]': userId,
    'sort[0]': 'updatedAt:desc',
    populate: 'background,screenshot'
  }

  if (status) {
    params['filters[status][$eq]'] = status
  }
  if (name) {
    params['filters[name][$contains]'] = name
  }

  const response = await axiosInstance.get('/designs', { params })
  return response.data
}

/**
 * 获取设计详情
 * @param {string} id - 设计ID
 * @returns {Promise} 设计详情数据
 */
export const getDesignDetail = async (id) => {
  const response = await axiosInstance.get(`/designs/${id}`, {
    params: {
      populate: '*'
    }
  })
  return response.data
}

/**
 * 更新设计状态
 * @param {string} id - 设计ID
 * @param {string} status - 新状态
 * @returns {Promise} 更新结果
 */
export const updateDesignStatus = async (id, status) => {
  const response = await axiosInstance.put(`/designs/${id}`, {
    data: {
      status
    }
  })
  return response.data
}

export const updateDesign = async (id, data) => {
  const response = await axiosInstance.put(`/designs/${id}`, {
    data
  })
  return response.data
}

/**
 * 删除设计
 * @param {string} id - 设计ID
 * @returns {Promise} 删除结果
 */
export const deleteDesign = async (id) => {
  const response = await axiosInstance.delete(`/designs/${id}`)
  return response.data
}

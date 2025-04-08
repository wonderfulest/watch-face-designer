import axiosInstance from '@/config/axiosConfigV5'

export const getFavorites = async ({ page, pageSize, userId }) => {
  const params = {
    'pagination[page]': page,
    'pagination[pageSize]': pageSize,
    'sort[0]': 'createdAt:desc',
    'populate': '*',  // 获取关联的设计信息
    'filters[users_permissions_user][id][$eq]': userId // 添加用户过滤
  }
  
  const response = await axiosInstance.get('/design-favorites', {
    params
  })
  return response.data
}

// 添加删除收藏的方法
export const deleteFavorite = async (documentId) => {
  const response = await axiosInstance.delete(`/design-favorites/${documentId}`)
  return response.data
}

// 添加收藏的方法
export const addFavorite = async (designId, userId) => {
  const data = {
    data: {
      name: 'Like 1',
      design: designId,
      users_permissions_user: userId,
      isActive: true
    }
  }
  
  const response = await axiosInstance.post('/design-favorites', data)
  return response.data
}
import axiosInstance from '@/config/axiosKpayConfig'

export const getSalesHistory = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/merchant/history', {
      params: {
        sort: params.sort || 'desc',
        start: params.start || 0,
        amount: params.amount || 100,
        successOnly: params.successOnly ?? false
      }
    })
    return response.data
  } catch (error) {
    console.error('获取销售记录失败:', error)
    throw error
  }
}
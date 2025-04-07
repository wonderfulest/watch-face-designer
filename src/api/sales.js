import axiosInstance from '@/config/axiosConfigV5'

export const getSalesHistory =async ({ page, pageSize }) => {
  const params = {
    'pagination[page]': page,
    'pagination[pageSize]': pageSize,
    'sort[0]': 'updatedAt:desc',
    'populate': '*' // 获取关联的文件信息
  }
  const response = await axiosInstance.get('/kpay-sales/with-designer', {
    params
  })
  return response.data
}

import axiosInstance from '@/config/axiosWristo'

/**
 * 同步产品到 WPay
 * @param {Object} data - 产品数据
 * @param {string} data.name - 产品名称
 * @param {string} data.description - 产品描述
 * @param {number} data.trialLasts - 试用时长（小时）
 * @param {number} data.price - 产品价格
 * @param {string} data.designId - 设计ID
 * @returns {Promise<Object>} 同步结果
 */
export const createProductToWristo = async (data) => {
    // 参数校验
    if (!data.name || typeof data.name !== 'string') {
        throw new Error('产品名称不能为空且必须是字符串')
    }

    if (!data.description || typeof data.description !== 'string') {
        throw new Error('产品描述不能为空且必须是字符串')
    }

    if (typeof data.trialLasts !== 'number' || data.trialLasts < 0) {
        throw new Error('试用时长必须是大于等于0的数字')
    }

    if (typeof data.price !== 'number' || data.price < 0) {
        throw new Error('产品价格必须是大于等于0的数字')
    }

    if (!data.designId || typeof data.designId !== 'string') {
        throw new Error('设计ID不能为空且必须是字符串')
    }

    const response = await axiosInstance.post('/products/create-from-studio', data)
    return response.data
}

export const getWPayProductByDesignId = async (data) => {
    const response = await axiosInstance.post(`/products/getOrCreateByDesignId`, {
        designId: data.designId,
        name: data.name,
        description: data.description,
        trialLasts: data.trialLasts,
        price: data.price,
        garminImageUrl: data.garminImageUrl,
        garminStoreUrl: data.garminStoreUrl
    })
    return response.data
}

export const updateProductByDesignId = async (data) => {
    const response = await axiosInstance.post('/products/updateByDesignId', {
        ...data,
        designId: data.designId,
        name: data.name,
        description: data.description,
        trialLasts: data.trialLasts,
        price: data.price,
        garminImageUrl: data.garminImageUrl,
        garminStoreUrl: data.garminStoreUrl
    })
    return response.data
}
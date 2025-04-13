import { ref } from 'vue'

// 编码器注册表
const encoderRegistry = ref(new Map())

// 注册编码器
export const registerEncoder = (elementType, encoder) => {
  encoderRegistry.value.set(elementType, encoder)
}

// 获取编码器
export const getEncoder = (elementType) => {
  return encoderRegistry.value.get(elementType)
}

// 编码元素
export const encodeElement = (element) => {
  const encoder = getEncoder(element.eleType)
  if (!encoder) {
    console.warn(`No encoder found for element type: ${element.eleType}`)
    return null
  }
  return encoder(element)
}

// 默认编码器
export const defaultEncoder = (element) => {
  return {
    type: element.eleType,
    ...element.toObject()
  }
}

// 注册默认编码器
registerEncoder('default', defaultEncoder) 
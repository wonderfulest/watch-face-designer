import { ref } from 'vue'

// 解码器注册表
const decoderRegistry = ref(new Map())

// 注册解码器
export const registerDecoder = (elementType, decoder) => {
  decoderRegistry.value.set(elementType, decoder)
}

// 获取解码器
export const getDecoder = (elementType) => {
  return decoderRegistry.value.get(elementType)
}

// 解码元素
export const decodeElement = (element) => {
  const decoder = getDecoder(element.type)
  if (!decoder) {
    console.warn(`No decoder found for element type: ${element.type}`)
    return null
  }
  return decoder(element)
}

// 默认解码器
export const defaultDecoder = (element) => {
  return {
    eleType: element.type,
    ...element
  }
}

// 注册默认解码器
registerDecoder('default', defaultDecoder) 
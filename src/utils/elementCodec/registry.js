import { ref } from 'vue'

// 编码器注册表
const encoderRegistry = ref(new Map())

// 解码器注册表
const decoderRegistry = ref(new Map())

// 注册编码器
export const registerEncoder = (elementType, encoder) => {
  encoderRegistry.value.set(elementType, encoder)
}

// 注册解码器
export const registerDecoder = (elementType, decoder) => {
  decoderRegistry.value.set(elementType, decoder)
}

// 获取编码器
export const getEncoder = (elementType) => {
  return encoderRegistry.value.get(elementType)
}

// 获取解码器
export const getDecoder = (elementType) => {
  return decoderRegistry.value.get(elementType)
} 
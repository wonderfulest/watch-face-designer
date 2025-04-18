// src/utils/elementCodec/progressLineCodec.js
import { registerEncoder, registerDecoder, registerAddElement } from './registry'
import { useProgressLineStore } from '@/stores/elements/progress/progressLineElement'

// 进度条编码器
const progressLineEncoder = (element) => {
  const progressLineStore = useProgressLineStore()
  return progressLineStore.encodeConfig(element)
}

// 进度条解码器
const progressLineDecoder = (element) => {
  const progressLineStore = useProgressLineStore()
  return progressLineStore.decodeConfig(element)
}

// 添加进度条元素
const addElement = (config) => {
  const progressLineStore = useProgressLineStore()
  return progressLineStore.addElement(config)
}

// 默认导出函数，用于自动注册
export default () => {
  registerEncoder('progressLine', progressLineEncoder)
  registerDecoder('progressLine', progressLineDecoder)
  registerAddElement('progressLine', addElement)
}
import { ref } from 'vue'
import { registerEncoder, registerDecoder, registerAddElement } from './registry'
import { useProgressRingStore } from '@/stores/elements/progress/progressRingElement'

// 进度环编码器
const encodeProgressRing = (element) => {
  const progressRingStore = useProgressRingStore()
  return progressRingStore.encodeConfig(element)
}

// 进度环解码器
const decodeProgressRing = (encoded) => {
  const progressRingStore = useProgressRingStore()
  return progressRingStore.decodeConfig(encoded)
}

const addElement = (config) => {
  const progressRingStore = useProgressRingStore()
  progressRingStore.addElement(config)
}

export default () => {
  registerEncoder('progressRing', encodeProgressRing)
  registerDecoder('progressRing', decodeProgressRing)
  registerAddElement('progressRing', addElement)
}

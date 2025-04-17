import { ref } from 'vue'
import { registerEncoder, registerDecoder, registerAddElement } from './registry'
import { useProgressRingStore } from '@/stores/elements/progressRingElement'

// 进度环编码器
const encodeProgressRing = (element) => {
  const progressRingStore = useProgressRingStore() 
  const mainRing = element.getObjects().find((obj) => obj.id.endsWith('_main'))
  const bgRing = element.getObjects().find((obj) => obj.id.endsWith('_bg'))
  if (!mainRing || !bgRing) {
    throw new Error('无效的元素')
  }
  return {
    type: 'progressRing',
    x: Math.round(element.left),
    y: Math.round(element.top),
    startAngle: mainRing.startAngle,
    endAngle: bgRing.endAngle,
    radius: mainRing.radius,
    strokeWidth: mainRing.strokeWidth,
    color: mainRing.stroke,
    bgColor: bgRing.stroke,
    metricGroup: element.metricGroup,
    metricSymbol: element.metricSymbol,
    fullAngle: progressRingStore.getFullAngle(mainRing.startAngle, bgRing.endAngle, mainRing.counterClockwise), // 不需要反序列化
    varName: element.varName,
    counterClockwise: mainRing.counterClockwise
  }
}

// 进度环解码器
const decodeProgressRing = (encoded) => {
  return {
    eleType: 'progressRing',
    left: encoded.x,
    top: encoded.y,
    startAngle: encoded.startAngle,
    endAngle: encoded.endAngle,
    radius: encoded.radius,
    strokeWidth: encoded.strokeWidth,
    color: encoded.color,
    bgColor: encoded.bgColor,
    metricGroup: encoded.metricGroup,
    metricSymbol: encoded.metricSymbol,
    varName: encoded.varName,
    counterClockwise: encoded.counterClockwise
  }
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

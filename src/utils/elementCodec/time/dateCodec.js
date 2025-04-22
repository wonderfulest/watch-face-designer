import { ref } from 'vue'
import { registerEncoder, registerDecoder, registerAddElement } from '../registry'
import { useDateStore } from '@/stores/elements/time/dateElement'

// 日期编码器
const dateEncoder = (element) => {
  return {
    type: 'date',
    x: Math.round(element.left),
    y: Math.round(element.top),
    originX: element.originX,
    originY: element.originY,
    font: element.fontFamily,
    size: element.fontSize,
    color: element.fill,
    formatter: element.formatter
  }
}

// 日期解码器
const dateDecoder = (element) => {
  return {
    eleType: 'date',
    left: element.x,
    top: element.y,
    color: element.color,
    fontFamily: element.font,
    fontSize: element.size,
    originX: element.originX,
    originY: element.originY,
    // 日期元素特有属性
    dateFormatter: element.formatter,
  }
}

const addElement = (config) => {
  const dateStore = useDateStore()
  dateStore.addElement(config)
}

export default () => {
  registerEncoder('date', dateEncoder)
  registerDecoder('date', dateDecoder)
  registerAddElement('date', addElement)
} 
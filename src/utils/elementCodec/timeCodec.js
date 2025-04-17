import { ref } from 'vue'
import { registerEncoder, registerDecoder } from './registry'

// 时间编码器
const timeEncoder = (element) => {
  return {
    type: 'time',
    x: element.left,
    y: element.top,
    originX: element.originX,
    originY: element.originY,
    font: element.fontFamily,
    size: element.fontSize,
    color: element.fill,
    formatter: element.formatter,
    // 其他时间元素特有的属性
  }
}

// 时间解码器
const timeDecoder = (element) => {
  return {
    type: 'time',
    left: element.x,
    top: element.y,
    fontSize: element.size,
    fontFamily: element.font,
    fill: element.color,
    originX: element.originX,
    originY: element.originY,
    // 时间元素特有属性
    formatter: element.formatter,
  }
}

export default () => {
  registerEncoder('time', timeEncoder)
  registerDecoder('time', timeDecoder)
} 
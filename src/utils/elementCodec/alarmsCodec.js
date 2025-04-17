import { ref } from 'vue'
import { registerEncoder, registerDecoder } from './registry'

// 闹钟编码器
const encodeAlarms = (element) => {
  const encoded = {
    type: 'alarms',
    x: element.x,
    y: element.y,
    size: element.size,
    font: element.font,
    color: element.fill,
  }
  return encoded
}

// 闹钟解码器
const decodeAlarms = (encoded) => {
  const element = ref({
    eleType: 'alarms',
    x: encoded.x,
    y: encoded.y,
    size: encoded.size,
    font: encoded.font,
    fill: encoded.color,
  })
  return element
}

export default () => {
  registerEncoder('alarms', encodeAlarms)
  registerDecoder('alarms', decodeAlarms)
} 
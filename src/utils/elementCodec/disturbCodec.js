import { ref } from 'vue'
import { registerEncoder, registerDecoder } from './registry'

// 勿扰编码器
const encodeDisturb = (element) => {
  const encoded = {
    type: 'disturb',
    x: element.x,
    y: element.y,
    size: element.size,
    font: element.font,
    color: element.fill,
  }
  return encoded
}

// 勿扰解码器
const decodeDisturb = (encoded) => {
  const element = ref({
    eleType: 'disturb',
    x: encoded.x,
    y: encoded.y,
    size: encoded.size,
    font: encoded.font,
    fill: encoded.color,
  })
  return element
}

export default () => {
  registerEncoder('disturb', encodeDisturb)
  registerDecoder('disturb', decodeDisturb)
} 
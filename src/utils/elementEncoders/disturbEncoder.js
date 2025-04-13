import { registerEncoder } from '../elementEncoder'

const disturbEncoder = (element) => {
  if (!element) {
    console.error('勿扰元素对象无效')
    return null
  }
  return {
    type: 'disturb',
    x: element.left,
    y: element.top,
    size: element.fontSize,
    font: element.fontFamily,
    color: element.fill
  }
}

// 注册勿扰元素编码器
registerEncoder('disturb', disturbEncoder) 
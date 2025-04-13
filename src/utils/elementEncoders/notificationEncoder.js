import { registerEncoder } from '../elementEncoder'

const notificationEncoder = (element) => {
  if (!element) {
    console.error('通知元素对象无效')
    return null
  }
  return {
    type: 'notification',
    x: element.left,
    y: element.top,
    size: element.fontSize,
    font: element.fontFamily,
    color: element.fill
  }
}

// 注册通知元素编码器
registerEncoder('notification', notificationEncoder) 
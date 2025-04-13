import { registerDecoder } from '../elementDecoder'

const notificationDecoder = (element) => {
  return {
    eleType: 'notification',
    left: element.x,
    top: element.y,
    fontSize: element.size,
    fontFamily: element.font,
    color: element.color
  }
}

// 注册通知元素解码器
registerDecoder('notification', notificationDecoder) 
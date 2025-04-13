import { registerDecoder } from '../elementDecoder'

const alarmsDecoder = (element) => {
  return {
    eleType: 'alarms',
    left: element.x,
    top: element.y,
    fontSize: element.size,
    fontFamily: element.font,
    color: element.color
  }
}

// 注册闹钟元素解码器
registerDecoder('alarms', alarmsDecoder) 
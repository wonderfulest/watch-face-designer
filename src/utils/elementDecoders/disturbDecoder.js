import { registerDecoder } from '../elementDecoder'

const disturbDecoder = (element) => {
  return {
    eleType: 'disturb',
    left: element.x,
    top: element.y,
    fontSize: element.size,
    fontFamily: element.font,
    color: element.color
  }
}

// 注册勿扰元素解码器
registerDecoder('disturb', disturbDecoder) 
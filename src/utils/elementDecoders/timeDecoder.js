import { registerDecoder } from '../elementDecoder'

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

// 注册时间元素解码器
registerDecoder('time', timeDecoder) 
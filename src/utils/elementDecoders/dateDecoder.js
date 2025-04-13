import { registerDecoder } from '../elementDecoder'

const dateDecoder = (element) => {
  return {
    eleType: 'date',
    left: element.x,
    top: element.y,
    color: element.color,
    fontFamily: element.font,
    size: element.size,
    dateFormatter: element.formatter,
    originX: element.originX,
    originY: element.originY
  }
}

// 注册日期元素解码器
registerDecoder('date', dateDecoder) 
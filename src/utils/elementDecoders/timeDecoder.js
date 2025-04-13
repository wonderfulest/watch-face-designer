import { registerDecoder } from './elementDecoder'

const timeDecoder = (element) => {
  return {
    type: 'time',
    left: element.x,
    top: element.y,
    width: element.width,
    height: element.height,
    format: element.format,
    fontSize: element.fontSize,
    fontFamily: element.fontFamily,
    color: element.color,
    alignment: element.alignment,
    showSeconds: element.showSeconds,
    showAmPm: element.showAmPm,
    // 其他时间元素特有的属性
  }
}

// 注册时间元素解码器
registerDecoder('time', timeDecoder) 
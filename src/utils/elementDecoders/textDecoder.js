import { registerDecoder } from '../elementDecoder'

const textDecoder = (element) => {
  return {
    eleType: 'text',
    left: element.x,
    top: element.y,
    width: element.width,
    height: element.height,
    text: element.text,
    fontSize: element.fontSize,
    fontFamily: element.fontFamily,
    fill: element.color,
    // 其他文本元素特有的属性
  }
}

// 注册文本元素解码器
registerDecoder('text', textDecoder) 
import { registerEncoder } from '../elementEncoder'

const textEncoder = (element) => {
  return {
    type: 'text',
    x: element.left,
    y: element.top,
    width: element.width,
    height: element.height,
    text: element.text,
    fontSize: element.fontSize,
    fontFamily: element.fontFamily,
    color: element.color,
    // 其他文本元素特有的属性
  }
}

// 注册文本元素编码器
registerEncoder('text', textEncoder) 
import { registerDecoder } from './elementDecoder'

const labelDecoder = (element) => {
  return {
    type: 'label',
    left: element.x,
    top: element.y,
    width: element.width,
    height: element.height,
    text: element.text,
    fontSize: element.fontSize,
    fontFamily: element.fontFamily,
    color: element.color,
    backgroundColor: element.backgroundColor,
    alignment: element.alignment,
    // 其他标签元素特有的属性
  }
}

registerDecoder('label', labelDecoder) 
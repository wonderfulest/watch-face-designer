import { registerDecoder } from './elementDecoder'

const rectDecoder = (element) => {
  return {
    type: 'rect',
    left: element.x,
    top: element.y,
    width: element.width,
    height: element.height,
    color: element.color,
    backgroundColor: element.backgroundColor,
    borderColor: element.borderColor,
    borderWidth: element.borderWidth,
    borderRadius: element.borderRadius,
    // 其他矩形元素特有的属性
  }
}

registerDecoder('rect', rectDecoder) 
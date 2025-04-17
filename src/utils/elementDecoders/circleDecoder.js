import { registerDecoder } from '../elementDecoder'

const circleDecoder = (element) => {
  return {
    type: 'circle',
    left: element.x,
    top: element.y,
    width: element.width,
    height: element.height,
    color: element.color,
    backgroundColor: element.backgroundColor,
    borderColor: element.borderColor,
    borderWidth: element.borderWidth,
    // 其他圆形元素特有的属性
  }
}

registerDecoder('circle', circleDecoder) 
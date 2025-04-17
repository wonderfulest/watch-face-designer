import { registerDecoder } from '../elementDecoder'

const imageDecoder = (element) => {
  return {
    type: 'image',
    left: element.x,
    top: element.y,
    width: element.width,
    height: element.height,
    src: element.src,
    opacity: element.opacity,
    rotation: element.rotation,
    // 其他图片元素特有的属性
  }
}

registerDecoder('image', imageDecoder) 
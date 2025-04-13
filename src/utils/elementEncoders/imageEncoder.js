import { registerEncoder } from '../elementEncoder'

const imageEncoder = (element) => {
  return {
    type: 'image',
    x: element.left,
    y: element.top,
    width: element.width,
    height: element.height,
    src: element.src,
    // 其他图片元素特有的属性
  }
}

// 注册图片元素编码器
registerEncoder('image', imageEncoder) 
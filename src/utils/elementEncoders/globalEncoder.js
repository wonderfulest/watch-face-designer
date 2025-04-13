import { registerEncoder } from '../elementEncoder'

const globalEncoder = (element) => {
  return {
    type: 'global',
    x: element.left,
    y: element.top,
    width: element.width,
    height: element.height,
    radius: element.radius,
    fill: element.fill,
    // 其他全局元素特有的属性
  }
}

// 注册全局元素编码器
registerEncoder('global', globalEncoder) 
import { registerDecoder } from '../elementDecoder'

const globalDecoder = (element) => {
  return {
    type: 'global',
    left: element.x,
    top: element.y,
    width: element.width,
    height: element.height,
    // 全局元素特有的属性
  }
}

registerDecoder('global', globalDecoder) 
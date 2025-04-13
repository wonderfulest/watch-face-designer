import { registerDecoder } from './elementDecoder'

const dataDecoder = (element) => {
  return {
    type: 'data',
    left: element.x,
    top: element.y,
    width: element.width,
    height: element.height,
    dataType: element.dataType,
    format: element.format,
    fontSize: element.fontSize,
    fontFamily: element.fontFamily,
    color: element.color,
    alignment: element.alignment,
    // 其他数据元素特有的属性
  }
}

registerDecoder('data', dataDecoder) 
import { registerEncoder } from '../elementEncoder'

const dateEncoder = (element) => {
  return {
    type: 'date',
    x: Math.round(element.left),
    y: Math.round(element.top),
    originX: element.originX,
    originY: element.originY,
    font: element.fontFamily,
    size: element.fontSize,
    color: element.fill,
    formatter: element.formatter
  }
}

// 注册日期元素编码器
registerEncoder('date', dateEncoder) 
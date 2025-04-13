import { registerEncoder } from '../elementEncoder'

const dataEncoder = (element) => {
  return {
    type: 'data',
    x: element.left,
    y: element.top,
    width: element.width,
    height: element.height,
    originX: element.originX,
    originY: element.originY,
    font: element.fontFamily,
    size: element.fontSize,
    color: element.fill,
    varName: element.varName,
    metricGroup: element.metricGroup,
    metricSymbol: element.metricSymbol,
    // 其他图标元素特有的属性
  }
}

// 注册图标元素编码器
registerEncoder('data', dataEncoder) 
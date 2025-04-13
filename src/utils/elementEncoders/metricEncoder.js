import { registerEncoder } from '../elementEncoder'

const metricEncoder = (element) => {
  return {
    type: 'metric',
    x: element.left,
    y: element.top,
    width: element.width,
    height: element.height,
    fontSize: element.fontSize,
    color: element.fill,
    metricSymbol: element.metricSymbol,
    varName: element.varName,
    alignment: element.textAlign,
    fontFamily: element.fontFamily,
    // 其他指标元素特有的属性
  }
}

// 注册指标元素编码器
registerEncoder('metric', metricEncoder) 
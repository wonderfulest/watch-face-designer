import { registerEncoder } from '../elementEncoder'
import { getMetricBySymbol } from '@/config/settings'

const iconEncoder = (element) => {
  const metric = getMetricBySymbol(element.metricSymbol)
  if (!metric) {
    throw new Error('未找到指标配置')
  }
  return {
    type: element.eleType,
    x: Math.round(element.left),
    y: Math.round(element.top),
    originX: element.originX,
    originY: element.originY,
    font: element.fontFamily,
    size: element.fontSize,
    color: element.fill,
    metricGroup: element.metricGroup,
    metricSymbol: element.metricSymbol,
    varName: element.varName,
    colorVarName: element.colorVarName
  }
}

// 注册图标元素编码器
registerEncoder('icon', iconEncoder) 
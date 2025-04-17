import { ref } from 'vue'
import { registerEncoder, registerDecoder } from './registry'

// 标签编码器
const labelEncoder = (element) => {
  return {
    type: 'label',
    x: Math.round(element.left),
    y: Math.round(element.top),
    originX: element.originX,
    originY: element.originY,
    font: element.fontFamily,
    size: element.fontSize,
    color: element.fill,
    varName: element.varName,
    metricGroup: element.metricGroup,
    metricSymbol: element.metricSymbol,
    text: element.text,
  }
}

// 标签解码器
const labelDecoder = (element) => {
  
  return {
    type: 'label',
    left: element.x,
    top: element.y,
    originX: element.originX,
    originY: element.originY,
    fontFamily: element.font,
    fontSize: element.size,
    fill: element.color,
    varName: element.varName,
    metricGroup: element.metricGroup,
    metricSymbol: element.metricSymbol,
    text: element.text,
  }
}

// 默认导出函数，用于自动注册
export default () => {
  registerEncoder('label', labelEncoder)
  registerDecoder('label', labelDecoder)
} 
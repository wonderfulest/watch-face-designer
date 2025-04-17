import { registerEncoder, registerDecoder, registerAddElement } from './registry'
import { useIconStore } from '@/stores/elements/iconElement'

// 图标编码器
const iconEncoder = (element) => {
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
  }
}

// 图标解码器
const iconDecoder = (element) => {
  return {
    eleType: 'icon',
    left: element.x,
    top: element.y,
    fill: element.color,
    iconFontFamily: element.font,
    fontSize: element.size,
    originX: element.originX,
    originY: element.originY,
    metricGroup: element.metricGroup,
    metricSymbol: element.metricSymbol,
    varName: element.varName,
  }
}

const addElement = (config) => {
  const iconStore = useIconStore()
  iconStore.addElement(config)
}

export default () => {
  registerEncoder('icon', iconEncoder)
  registerDecoder('icon', iconDecoder)
  registerAddElement('icon', addElement)
}
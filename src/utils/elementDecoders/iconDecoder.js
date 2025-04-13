import { registerDecoder } from '../elementDecoder'

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
    colorVarName: element.colorVarName
  }
}

// 注册图标元素解码器
registerDecoder('icon', iconDecoder) 
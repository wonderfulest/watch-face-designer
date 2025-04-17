import { ref } from 'vue'
import { registerEncoder, registerDecoder, registerAddElement } from './registry'
import { useDataStore } from '@/stores/elements/dataElement'

// 数据编码器
const dataEncoder = (element) => {
  return {
    type: 'data',
    x: element.left,
    y: element.top,
    originX: element.originX,
    originY: element.originY,
    font: element.fontFamily,
    size: element.fontSize,
    fill: element.fill,
    // 其他图标元素特有的属性
    varName: element.varName,
    metricGroup: element.metricGroup,
    metricSymbol: element.metricSymbol
  }
}

// 数据解码器
const dataDecoder = (element) => {
  return {
    type: 'data',
    left: element.x,
    top: element.y,
    originX: element.originX,
    originY: element.originY,
    fontFamily: element.font,
    fontSize: element.size,
    fill: element.fill,
    varName: element.varName,
    metricGroup: element.metricGroup,
    metricSymbol: element.metricSymbol
  }
}

const addElement = (config) => {
  const dataStore = useDataStore()
  dataStore.addElement(config)
}

// 默认导出函数，用于自动注册
export default () => {
  registerEncoder('data', dataEncoder)
  registerDecoder('data', dataDecoder)
  registerAddElement('data', addElement)
}

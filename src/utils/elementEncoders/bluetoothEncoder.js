import { registerEncoder } from '../elementEncoder'

const bluetoothEncoder = (element) => {
  if (!element) {
    console.error('蓝牙元素对象无效')
    return null
  }
  return {
    type: 'bluetooth',
    x: element.left,
    y: element.top,
    size: element.fontSize,
    font: element.fontFamily,
    color: element.fill
  }
}

// 注册蓝牙元素编码器
registerEncoder('bluetooth', bluetoothEncoder) 
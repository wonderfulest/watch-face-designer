import { registerDecoder } from '../elementDecoder'

const bluetoothDecoder = (element) => {
  return {
    eleType: 'bluetooth',
    left: element.x,
    top: element.y,
    fontSize: element.size,
    fontFamily: element.font,
    color: element.color
  }
}

// 注册蓝牙元素解码器
registerDecoder('bluetooth', bluetoothDecoder) 
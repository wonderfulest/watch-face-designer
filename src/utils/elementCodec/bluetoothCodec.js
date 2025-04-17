import { ref } from 'vue'
import { registerEncoder, registerDecoder, registerAddElement } from './registry'
import { useBluetoothStore } from '@/stores/elements/bluetoothElement'

// 蓝牙编码器
const encodeBluetooth = (element) => {
  const encoded = {
    type: 'bluetooth',
    x: element.x,
    y: element.y,
    size: element.size,
    font: element.font,
    fill: element.color,
  }
  return encoded
}

// 蓝牙解码器
const decodeBluetooth = (encoded) => {
  const element = ref({
    type: 'bluetooth',
    x: encoded.x,
    y: encoded.y,
    size: encoded.size,
    font: encoded.font,
    fill: encoded.color,
  })
  return element
}

const addElement = (config) => {
  const bluetoothStore = useBluetoothStore()
  bluetoothStore.addElement(config)
}

export default () => {
  registerEncoder('bluetooth', encodeBluetooth)
  registerDecoder('bluetooth', decodeBluetooth)
  registerAddElement('bluetooth', addElement)
} 
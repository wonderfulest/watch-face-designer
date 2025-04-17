import { ref } from 'vue'
import { registerEncoder, registerDecoder, registerAddElement } from './registry'
import { useAlarmsStore } from '@/stores/elements/alarmsElement'

// 闹钟编码器
const encodeAlarms = (element) => {
  const encoded = {
    type: 'alarms',
    x: element.x,
    y: element.y,
    size: element.size,
    font: element.font,
    color: element.fill,
  }
  return encoded
}

// 闹钟解码器
const decodeAlarms = (encoded) => {
  const element = ref({
    eleType: 'alarms',
    x: encoded.x,
    y: encoded.y,
    size: encoded.size,
    font: encoded.font,
    fill: encoded.color,
  })
  return element
}

const addElement = (config) => {
  const alarmsStore = useAlarmsStore()
  alarmsStore.addElement(config)
}

export default () => {
  registerEncoder('alarms', encodeAlarms)
  registerDecoder('alarms', decodeAlarms)
  registerAddElement('alarms', addElement)
} 
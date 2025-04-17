import { ref } from 'vue'
import { registerEncoder, registerDecoder, registerAddElement } from './registry'
import { useNotificationStore } from '@/stores/elements/notificationElement'

// 通知编码器
const encodeNotification = (element) => {
  const encoded = {
    type: 'notification',
    x: element.x,
    y: element.y,
    size: element.size,
    font: element.font,
    color: element.fill,
  }
  return encoded
}

// 通知解码器
const decodeNotification = (encoded) => {
  const element = ref({
    eleType: 'notification',
    x: encoded.x,
    y: encoded.y,
    size: encoded.size,
    font: encoded.font,
    fill: encoded.color,
  })
  return element
}

const addElement = (config) => {
  const notificationStore = useNotificationStore()
  notificationStore.addElement(config)
}

export default () => {
  registerEncoder('notification', encodeNotification)
  registerDecoder('notification', decodeNotification)
  registerAddElement('notification', addElement)
} 
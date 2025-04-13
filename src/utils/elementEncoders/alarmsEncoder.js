import { registerEncoder } from '../elementEncoder'

const alarmsEncoder = (element) => {
  if (!element) {
    console.error('闹钟元素对象无效')
    return null
  }
  try {
    return {
      type: 'alarms',
      x: element.left,
      y: element.top,
      size: element.fontSize,
      font: element.fontFamily,
      color: element.fill
    }
  } catch (error) {
    console.error('编码闹钟元素配置时出错:', error)
    return null
  }
}

// 注册闹钟元素编码器
registerEncoder('alarms', alarmsEncoder) 
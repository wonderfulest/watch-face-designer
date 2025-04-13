import { registerEncoder } from '../elementEncoder'

const timeEncoder = (element) => {
  return {
    type: 'time',
    x: element.left,
    y: element.top,
    originX: element.originX,
    originY: element.originY,
    font: element.fontFamily,
    size: element.fontSize,
    color: element.fill,
    formatter: element.formatter,
    // 其他时间元素特有的属性
  }
}

// 注册时间元素编码器
registerEncoder('time', timeEncoder) 


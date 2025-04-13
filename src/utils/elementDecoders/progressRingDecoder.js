import { registerDecoder } from './elementDecoder'

const progressRingDecoder = (element) => {
  return {
    type: 'progressRing',
    left: element.x,
    top: element.y,
    width: element.width,
    height: element.height,
    value: element.value,
    maxValue: element.maxValue,
    color: element.color,
    backgroundColor: element.backgroundColor,
    thickness: element.thickness,
    startAngle: element.startAngle,
    // 其他进度环元素特有的属性
  }
}

registerDecoder('progressRing', progressRingDecoder) 
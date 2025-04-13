import { registerDecoder } from './elementDecoder'

const badgeDecoder = (element) => {
  return {
    type: 'badge',
    left: element.x,
    top: element.y,
    width: element.width,
    height: element.height,
    color: element.color,
    backgroundColor: element.backgroundColor,
    borderColor: element.borderColor,
    borderWidth: element.borderWidth,
    borderRadius: element.borderRadius,
    // 其他徽章元素特有的属性
  }
}

registerDecoder('badge', badgeDecoder) 
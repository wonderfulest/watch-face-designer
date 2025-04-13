import { registerEncoder } from '../elementEncoder'

const badgeEncoder = (element) => {
  return {
    type: 'badge',
    x: element.left,
    y: element.top,
    width: element.width,
    height: element.height,
    fontSize: element.fontSize,
    color: element.fill,
    text: element.text,
    alignment: element.textAlign,
    fontFamily: element.fontFamily,
    // 其他徽章元素特有的属性
  }
}

// 注册徽章元素编码器
registerEncoder('badge', badgeEncoder) 
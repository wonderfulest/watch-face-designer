// 自动加载所有编码器插件
const encoderModules = import.meta.glob('./*.js', { eager: true })

// 导出编码器相关方法
import { encodeElement, registerEncoder, getEncoder } from '../elementEncoder'
export { encodeElement, registerEncoder, getEncoder } 
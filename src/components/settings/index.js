// src/components/settings/index.js

// 使用 Vite 的 import.meta.glob 自动导入所有设置组件，包括子文件夹
const modules = import.meta.glob(['./**/*Settings.vue'], { eager: true })

// 创建组件映射表
const componentMap = {}

// 处理每个设置组件
Object.entries(modules).forEach(([path, module]) => {
  // 从文件路径中提取组件类型
  // 例如: 
  // './BatterySettings.vue' -> 'battery'
  // './shapes/CircleSettings.vue' -> 'circle'
  // './shapes/RectangleSettings.vue' -> 'rectangle'
  const type = path.match(/\/(\w+)Settings\.vue$/)[1].toLowerCase()
  componentMap[type] = module.default
})

// 获取设置组件的函数
export function getSettingsComponent(type) {
  return componentMap[type]
}

export default componentMap
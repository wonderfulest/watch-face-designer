// src/components/settings/index.js

// 使用 Vite 的 import.meta.glob 自动导入所有设置组件
const modules = import.meta.glob('./*Settings.vue', { eager: true })

// 创建组件映射表
const componentMap = {}

// 处理每个设置组件
Object.entries(modules).forEach(([path, module]) => {
  // 从文件路径中提取组件类型
  // 例如: './BatterySettings.vue' -> 'battery'
  const type = path.match(/\.\/(\w+)Settings\.vue$/)[1].toLowerCase()
  componentMap[type] = module.default
})

// 获取设置组件
export const getSettingsComponent = (type) => {
  const componentName = type?.toLowerCase()
  return componentMap[componentName] || componentMap.base
}

// 导出所有设置组件，以便需要时可以单独使用
export const settingsComponents = componentMap
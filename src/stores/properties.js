import { defineStore } from 'pinia'

export const usePropertiesStore = defineStore('properties', {
  state: () => ({
    properties: {},
    defaultColorOptions: [
      { label: 'White', value: '0xFFFFFF' },
      { label: 'Yellow', value: '0xFFFF55' },
      { label: 'Magenta', value: '0xFF55FF' },
      { label: 'Red', value: '0xFF5555' },
      { label: 'Cyan', value: '0x55FFFF' },
      { label: 'Green', value: '0x55FF55' },
      { label: 'Blue', value: '0x5555FF' },
      { label: 'Dark Gray', value: '0x555555' },
      { label: 'Light Gray', value: '0xAAAAAA' },
      { label: 'Dark Yellow', value: '0xAA5500' },
      { label: 'Dark Magenta', value: '0xAA00AA' },
      { label: 'Dark Red', value: '0xAA0000' },
      { label: 'Dark Cyan', value: '0x00AAAA' },
      { label: 'Dark Green', value: '0x00AA00' },
      { label: 'Dark Blue', value: '0x0000AA' },
      { label: 'Black', value: '0x000000' },
      { label: 'Transparent', value: '-1' }
    ]
  }),

  getters: {
    allProperties: (state) => state.properties,
    
    getPropertyValue: (state) => (key) => state.properties[key]?.value,
    
    getDefaultValue: () => (type) => {
      switch (type) {
        case 'color':
          return '0xffffff'
        case 'number':
          return 0
        case 'string':
          return ''
        case 'boolean':
          return false
        case 'date':
          return new Date().toISOString()
        case 'select':
          return ''
        default:
          return ''
      }
    },

    // 获取颜色属性的默认选项
    getDefaultColorOptions: (state) => state.defaultColorOptions,

    // 验证颜色值是否有效
    isValidColorValue: () => (value) => {
      if (value === '-1') return true // 支持透明色
      return /^0x[0-9A-Fa-f]{6}$/.test(value)
    }
  },

  actions: {
    loadProperties(properties) {
      this.properties = properties
    },

    addProperty(propertyData) {
      this.properties[propertyData.key] = {
        type: propertyData.type,
        title: propertyData.title,
        options: propertyData.options,
        value: propertyData.defaultValue || 
               this.properties[propertyData.key]?.value || 
               propertyData.options[0]?.value || 
               this.getDefaultValue(propertyData.type),
        prompt: propertyData.prompt,
        errorMessage: propertyData.errorMessage
      }
    },

    editProperty(key, propertyData) {
      if (this.properties[key]) {
        this.properties[key] = {
          ...this.properties[key],
          ...propertyData,
          value: propertyData.defaultValue || 
                 this.properties[key].value || 
                 propertyData.options[0]?.value || 
                 this.getDefaultValue(propertyData.type)
        }
      }
    },

    deleteProperty(key) {
      if (this.properties[key]) {
        delete this.properties[key]
      }
    },

    setPropertyValue(key, value) {
      if (this.properties[key]) {
        this.properties[key].value = value
      }
    },

    // 添加颜色选项
    addColorOption(key, option) {
      if (this.properties[key] && this.properties[key].type === 'color') {
        if (!this.properties[key].options) {
          this.properties[key].options = []
        }
        this.properties[key].options.push(option)
      }
    },

    // 删除颜色选项
    deleteColorOption(key, index) {
      if (this.properties[key] && this.properties[key].type === 'color') {
        this.properties[key].options.splice(index, 1)
      }
    },

    // 移动颜色选项
    moveColorOption(key, index, direction) {
      if (this.properties[key] && this.properties[key].type === 'color') {
        const options = this.properties[key].options
        if (direction === 'up' && index > 0) {
          const temp = options[index]
          options[index] = options[index - 1]
          options[index - 1] = temp
        } else if (direction === 'down' && index < options.length - 1) {
          const temp = options[index]
          options[index] = options[index + 1]
          options[index + 1] = temp
        }
      }
    }
  }
}) 
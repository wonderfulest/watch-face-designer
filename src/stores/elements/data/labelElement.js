import { defineStore } from 'pinia'
import { useBaseStore } from '@/stores/baseStore'
import { useLayerStore } from '@/stores/layerStore'
import { usePropertiesStore } from '@/stores/properties'
import { nanoid } from 'nanoid'
import { FabricText } from 'fabric'
import { getMetricByProperty } from '@/config/settings'

export const useLabelStore = defineStore('labelElement', {
  state: () => {
    const baseStore = useBaseStore()
    const layerStore = useLayerStore()
    const propertiesStore = usePropertiesStore()
    return {
      baseStore,
      layerStore,
      propertiesStore,
      elements: {},
      progressMap: {}
    }
  },

  actions: {
    // 应用文本大小写设置
    applyTextCase(text) {
      if (!text) return text
      
      const textCase = this.baseStore.textCase
      if (textCase === 1) { // 全大写
        return text.toUpperCase()
      } else if (textCase === 2) { // 全小写
        return text.toLowerCase()
      } else if (textCase === 3) { // 驼峰式
        // 将每个单词的首字母大写
        return text.replace(/\b\w/g, c => c.toUpperCase())
      }
      
      return text
    },
    
    async addElement(options = {}) {
      if (!this.baseStore.canvas) {
        throw new Error('画布未初始化，无法添加标签元素')
      }

      try {
        const metric = getMetricByProperty(options.dataProperty, this.propertiesStore.allProperties)
        
        // 获取原始文本并应用大小写设置
        let originalText = 'Label'
        
        if (metric) {
          // 根据 labelLengthType 选择合适的标签长度
          if (typeof metric.enLabel === 'object') {
            const labelLengthType = this.baseStore.labelLengthType
            
            if (labelLengthType === 1) { // 短文本
              originalText = metric.enLabel.short || metric.enLabel.medium || metric.enLabel.long || 'Label'
            } else if (labelLengthType === 2) { // 中等文本
              originalText = metric.enLabel.medium || metric.enLabel.short || metric.enLabel.long || 'Label'
            } else if (labelLengthType === 3) { // 长文本
              originalText = metric.enLabel.long || metric.enLabel.medium || metric.enLabel.short || 'Label'
            } else { // 默认使用短文本
              originalText = metric.enLabel.short || metric.enLabel.medium || metric.enLabel.long || 'Label'
            }
          } else {
            // 兼容旧版本，如果 enLabel 不是对象而是字符串
            originalText = metric.enLabel
          }
        }
        
        const formattedText = this.applyTextCase(originalText)

        const labelOptions = {
          id: nanoid(),
          eleType: 'label',
          left: options.left,
          top: options.top,
          fontSize: options.fontSize,
          fill: options.fill,
          fontFamily: options.fontFamily,
          originX: options.originX,
          originY: options.originY,
          selectable: true,
          hasControls: true,
          hasBorders: true,
          dataProperty: options.dataProperty,
          text: formattedText,
          originalText: originalText, // 保存原始文本，以便在大小写设置变化时可以重新格式化
        }

        // 创建文本对象
        const element = new FabricText(labelOptions.text, labelOptions)

        // 添加到画布
        this.baseStore.canvas.add(element)

        // 添加到图层
        this.layerStore.addLayer(element)

        // 渲染画布
        this.baseStore.canvas.renderAll()

        // 设置为当前选中对象
        this.baseStore.canvas.discardActiveObject()
        this.baseStore.canvas.setActiveObject(element)
        
        // 添加更新方法以响应全局文本大小写设置变化
        const updateTextCase = () => {
          if (element.originalText) {
            element.set('text', this.applyTextCase(element.originalText))
            this.baseStore.canvas.renderAll()
          }
        }
        
        // 监听 baseStore 中的 textCase 变化
        const unwatch = this.baseStore.$subscribe((mutation, state) => {
          // 检查是否是 textCase 属性变化
          if (mutation.type === 'direct' && 
              mutation.storeId === 'baseStore' && 
              mutation.payload && 
              'textCase' in mutation.payload) {
            // 当全局文本大小写设置变化时更新文本
            setTimeout(() => {
              updateTextCase()
            }, 0)
          }
        })
        
        // 将监听器存储在元素上，以便在元素被删除时可以移除监听器
        element.textCaseUnwatch = unwatch

        return element
      } catch (error) {
        console.error('添加标签元素失败:', error)
        throw error
      }
    },

    updateElement(element, options) {
      if (!element || !this.baseStore.canvas) return

      try {
        const updates = {}

        if (options.dataProperty !== undefined) {
          const metric = getMetricByProperty(options.dataProperty, this.propertiesStore)
          if (metric) {
            let originalText = 'Label'
            if (typeof metric.enLabel === 'object') {
              const labelLengthType = this.baseStore.labelLengthType
              if (labelLengthType === 1) {
                originalText = metric.enLabel.short || metric.enLabel.medium || metric.enLabel.long || 'Label'
              } else if (labelLengthType === 2) {
                originalText = metric.enLabel.medium || metric.enLabel.short || metric.enLabel.long || 'Label'
              } else if (labelLengthType === 3) {
                originalText = metric.enLabel.long || metric.enLabel.medium || metric.enLabel.short || 'Label'
              } else {
                originalText = metric.enLabel.short || metric.enLabel.medium || metric.enLabel.long || 'Label'
              }
            } else {
              originalText = metric.enLabel
            }
            updates.text = this.applyTextCase(originalText)
            updates.originalText = originalText
            updates.dataProperty = options.dataProperty
          }
        }
        if (options.goalProperty !== undefined) {
          const metric = getMetricByProperty(options.goalProperty, this.propertiesStore)
          updates.text = metric.enLabel
          updates.goalProperty = options.goalProperty
          updates.dataProperty = null
        }

        if (options.fontSize !== undefined) {
          updates.fontSize = Number(options.fontSize)
        }

        if (options.fill !== undefined) {
          updates.fill = options.fill
        }

        if (options.fontFamily !== undefined) {
          updates.fontFamily = options.fontFamily
        }

        if (options.originX !== undefined) {
          updates.originX = options.originX
        }

        if (options.left !== undefined) {
          updates.left = options.left
        }

        if (options.top !== undefined) {
          updates.top = options.top
        }

        element.set(updates)
        element.setCoords()
        this.baseStore.canvas.requestRenderAll()
      } catch (error) {
        console.error('更新标签元素失败:', error)
        throw error
      }
    },

    encodeConfig(element) {
      return {
        type: element.eleType,
        x: Math.round(element.left),
        y: Math.round(element.top),
        originX: element.originX,
        originY: element.originY,
        font: element.fontFamily,
        size: element.fontSize,
        color: element.fill,
        dataProperty: element.dataProperty,
        text: element.text,
      }
    },

    decodeConfig(config) {
      return {
        eleType: 'label',
        left: config.x,
        top: config.y,
        fill: config.color,
        fontFamily: config.font,
        fontSize: config.size,
        originX: config.originX,
        originY: config.originY,
        dataProperty: config.dataProperty,
        text: config.text,
      }
    }
  }
})

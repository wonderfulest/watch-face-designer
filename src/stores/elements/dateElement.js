import { defineStore } from 'pinia'
import { useBaseStore } from '../baseStore'
import { useLayerStore } from '../layerStore'
import { nanoid } from 'nanoid'
import moment from 'moment'
import { FabricText } from 'fabric'
import { DateFormatOptions } from '@/config/settings'

export const useDateStore = defineStore('dateElement', {
  state: () => {
    const baseStore = useBaseStore()
    const layerStore = useLayerStore()

    return {
      dateElements: [],
      baseStore,
      layerStore
    }
  },

  actions: {
    formatDate(date, format) {
      return moment(date).format(format)
    },

    async addElement(options = {}) {
      if (!this.baseStore.canvas) {
        throw new Error('画布未初始化，无法添加日期元素')
      }

      try {
        const elementId = nanoid()
        const formatter = DateFormatOptions.find((option) => option.value === options.dateFormatter).label
        let text = this.formatDate(new Date(), formatter)
        const attr = {
          eleType: 'date',
          id: elementId,
          left: options.left,
          top: options.top,
          originX: options.originX,
          originY: options.originY,
          fontSize: options.size,
          fill: options.color,
          fontFamily: options.fontFamily,
          formatter: options.dateFormatter,
          selectable: true,
          hasControls: true,
          hasBorders: true
        }
        console.log(111, attr)
        // 创建文本对象
        const element = new FabricText(text, attr)

        this.baseStore.canvas.add(element)

        // 添加到图层 store
        const layer = this.layerStore.addLayer(element)

        // 设置为当前选中对象
        this.baseStore.canvas.setActiveObject(element)

        this.baseStore.canvas.renderAll()

        return element
      } catch (error) {
        console.error('创建日期元素失败:', error)
        throw error
      }
    },

    encodeConfig(element) {
      if (!element) {
        throw new Error('无效的元素')
      }
      return {
        type: 'date',
        x: Math.round(element.left),
        y: Math.round(element.top),
        originX: element.originX,
        originY: element.originY,
        font: element.fontFamily,
        size: element.fontSize,
        color: element.fill,
        formatter: element.formatter
      }
    },
    decodeConfig(config) {
      const decodedConfig = {
        left: config.x,
        top: config.y,
        color: config.color,
        fontFamily: config.font,
        size: config.size,
        dateFormatter: config.formatter,
        originX: config.originX,
        originY: config.originY
      }
      return decodedConfig
    }
  }
})

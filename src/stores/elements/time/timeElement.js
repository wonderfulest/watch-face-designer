import { defineStore } from 'pinia'
import { useBaseStore } from '@/stores/baseStore'
import { useLayerStore } from '@/stores/layerStore'
import { nanoid } from 'nanoid'
import moment from 'moment'
import { FabricText } from 'fabric'
import { TimeFormatOptions } from '@/config/settings'

export const useTimeStore = defineStore('timeStore', {
  state: () => {
    const baseStore = useBaseStore()
    const layerStore = useLayerStore()
    return {
      timeElements: [],
      updateInterval: null,
      baseStore,
      layerStore
    }
  },

  actions: {
    formatTime(date, format) {
      return moment(date).format(format)
    },
    async addElement(options = {}) {
      if (!this.baseStore.canvas) {
        throw new Error('画布未初始化，无法添加时间元素')
      }

      try {
        let text = this.formatTime(new Date(), TimeFormatOptions.find((option) => option.value === options.formatter).label)
        const timeOptions = {
          eleType: 'time',
          id: nanoid(),
          left: options.left,
          top: options.top,
          originX: options.originX,
          originY: options.originY,
          fontSize: Number(options.fontSize),
          fill: options.fill,
          fontFamily: options.fontFamily,
          formatter: options.formatter,
          selectable: true,
          hasControls: true,
          hasBorders: true,
        }
        const element = new FabricText(text, timeOptions)
        this.baseStore.canvas.add(element)
        this.layerStore.addLayer(element)
        this.baseStore.canvas.setActiveObject(element)
        this.baseStore.canvas.renderAll()
        return element
      } catch (error) {
        console.error('创建时间元素失败:', error)
        throw error
      }
    },
    updateTimeDisplay() {
      const now = new Date()
      this.timeElements.forEach((element) => {
        if (!element.element) return
        const formattedTime = this.formatTime(now, element.element.formatter)
        element.element.set('text', formattedTime)
      })

      if (this.baseStore.canvas) {
        this.baseStore.canvas.renderAll()
      }
    },
    startTimeUpdate() {
      this.updateInterval = setInterval(() => this.updateTimeDisplay(), 1000)
    },
    stopTimeUpdate() {
      if (this.updateInterval) {
        clearInterval(this.updateInterval)
        this.updateInterval = null
      }
    },
    updateElement(element, config) {
      if (!this.baseStore.canvas) return
      const obj = this.baseStore.canvas.getObjects().find((o) => o.id === element.id)
      if (!obj) return

      // 保存当前位置
      const currentLeft = obj.left
      const currentTop = obj.top

      // 更新属性
      const updateProps = {
        fontSize: config.fontSize,
        fill: config.fill,
        fontFamily: config.fontFamily,
        formatter: config.formatter,
        originX: config.originX,
        originY: config.originY
      }

      // 过滤掉未定义的属性
      Object.keys(updateProps).forEach(key => {
        if (updateProps[key] !== undefined) {
          obj.set(key, updateProps[key])
        }
      })

      // 如果有格式化器变化，更新文本
      if (config.formatter !== undefined) {
        const formatterOption = TimeFormatOptions.find(option => option.value === config.formatter)
        if (formatterOption) {
          obj.set('text', this.formatTime(new Date(), formatterOption.label))
        }
      }

      // 恢复位置
      if (config.left === undefined) {
        obj.set('left', currentLeft)
      }
      if (config.top === undefined) {
        obj.set('top', currentTop)
      }

      obj.setCoords()
      this.baseStore.canvas.renderAll()
    }
  }
})

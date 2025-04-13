import { defineStore } from 'pinia'
import { useBaseStore } from '@/stores/baseStore'
import { FabricText } from 'fabric'

export const useAlarmsStore = defineStore('alarmsElement', {
  state: () => ({
    elements: []
  }),

  actions: {
    addElement(config = {}) {
      const baseStore = useBaseStore()
      if (!baseStore.canvas) return

      const alarmsIcon = new FabricText('\u0024', {
        eleType: 'alarms',
        left: config.left || 100,
        top: config.top || 100,
        fontSize: config.fontSize || 24,
        fontFamily: config.fontFamily || 'Yoghurt-One',
        fill: config.color || '#ffffff',
        selectable: true,
        evented: true,
        originX: 'center',
        originY: 'center'
      })

      alarmsIcon.set('text', '\u0024')
      baseStore.canvas.add(alarmsIcon)
      baseStore.canvas.setActiveObject(alarmsIcon)
      this.elements.push(alarmsIcon)
      baseStore.canvas.renderAll()
    },

    updateAlarmsStatus(status) {
      const baseStore = useBaseStore()
      if (!baseStore.canvas) return

      this.elements.forEach(element => {
        if (element.eleType === 'alarms') {
          element.set('fill', status ? '#ffffff' : '#666666')
          baseStore.canvas.renderAll()
        }
      })
    },

    encodeConfig(element) {
      if (!element) {
        console.error('闹钟元素对象无效')
        return null
      }
      try {
        return {
          type: 'alarms',
          x: element.left,
          y: element.top,
          size: element.fontSize,
          font: element.fontFamily,
          color: element.fill
        }
      } catch (error) {
        console.error('编码闹钟元素配置时出错:', error)
        return null
      }
    },

    decodeConfig(config) {
      return {
        left: config.x,
        top: config.y,
        fontSize: config.size,
        fontFamily: config.font,
        color: config.color
      }
    }
  }
}) 
import { defineStore } from 'pinia'
import { useBaseStore } from '@/stores/baseStore'
import { FabricText } from 'fabric'

export const useDisturbStore = defineStore('disturbElement', {
  state: () => ({
    elements: []
  }),

  actions: {
    addElement(config = {}) {
      const baseStore = useBaseStore()
      if (!baseStore.canvas) return

      const disturbIcon = new FabricText('\u0021', {
        eleType: 'disturb',
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

      disturbIcon.set('text', '\u0021')
      baseStore.canvas.add(disturbIcon)
      baseStore.canvas.setActiveObject(disturbIcon)
      this.elements.push(disturbIcon)
      baseStore.canvas.renderAll()
    },

    updateDisturbStatus(status) {
      const baseStore = useBaseStore()
      if (!baseStore.canvas) return

      this.elements.forEach(element => {
        if (element.eleType === 'disturb') {
          element.set('fill', status ? '#ffffff' : '#666666')
          baseStore.canvas.renderAll()
        }
      })
    },

    encodeConfig(element) {
      if (!element) {
        console.error('勿扰元素对象无效')
        return null
      }
      
      try {
        return {
          type: 'disturb',
          left: element.left,
          top: element.top,
          fontSize: element.fontSize,
          fontFamily: element.fontFamily || 'Yoghurt-One',
          color: element.fill
        }
      } catch (error) {
        console.error('编码勿扰元素配置时出错:', error)
        return null
      }
    },

    decodeConfig(config) {
      return {
        left: config.left,
        top: config.top,
        fontSize: config.fontSize,
        fontFamily: config.fontFamily || 'Yoghurt-One',
        color: config.color
      }
    }
  }
}) 
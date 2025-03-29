import { defineStore } from 'pinia'
import { useBaseStore } from '@/stores/baseStore'
import { FabricText } from 'fabric'

export const useNotificationStore = defineStore('notificationElement', {
  state: () => ({
    elements: []
  }),

  actions: {
    addElement(config = {}) {
      const baseStore = useBaseStore()
      if (!baseStore.canvas) return

      const notificationIcon = new FabricText('\u0025', {
        eleType: 'notification',
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

      notificationIcon.set('text', '\u0025')
      baseStore.canvas.add(notificationIcon)
      baseStore.canvas.setActiveObject(notificationIcon)
      this.elements.push(notificationIcon)
      baseStore.canvas.renderAll()
    },

    updateNotificationStatus(status) {
      const baseStore = useBaseStore()
      if (!baseStore.canvas) return

      this.elements.forEach(element => {
        if (element.eleType === 'notification') {
          element.set('fill', status ? '#ffffff' : '#666666')
          baseStore.canvas.renderAll()
        }
      })
    },

    encodeConfig(element) {
      if (!element) {
        console.error('通知元素对象无效')
        return null
      }
      return {
        type: 'notification',
        left: element.left,
        top: element.top,
        fontSize: element.fontSize,
        fontFamily: element.fontFamily,
        color: element.fill
      }
    },

    decodeConfig(config) {
      return {
        left: config.left,
        top: config.top,
        fontSize: config.fontSize,
        fontFamily: config.fontFamily ,
        color: config.color
      }
    }
  }
}) 
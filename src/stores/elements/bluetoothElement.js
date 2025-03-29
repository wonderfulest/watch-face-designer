import { defineStore } from 'pinia'
import { useBaseStore } from '@/stores/baseStore'
import { FabricText } from 'fabric'

export const useBluetoothStore = defineStore('bluetoothElement', {
  state: () => ({
    elements: []
  }),

  actions: {
    // 添加蓝牙指示器元素
    addElement(config = {}) {
      const baseStore = useBaseStore()
      if (!baseStore.canvas) return

      // 创建蓝牙图标
      const bluetoothIcon = new FabricText('\u0022', {
        eleType: 'bluetooth',
        left: config.left,
        top: config.top,
        fontSize: config.fontSize,
        fontFamily: config.fontFamily,
        fill: config.color,
        selectable: true,
        evented: true,
        originX: 'center',
        originY: 'center'
      })

      // 设置蓝牙图标
      bluetoothIcon.set('text', '\u0022')
      
      // 添加到画布
      baseStore.canvas.add(bluetoothIcon)
      baseStore.canvas.setActiveObject(bluetoothIcon)
      
      // 保存到状态中
      this.elements.push(bluetoothIcon)
      
      // 渲染画布
      baseStore.canvas.renderAll()
    },

    // 更新蓝牙状态
    updateBluetoothStatus(status) {
      const baseStore = useBaseStore()
      if (!baseStore.canvas) return

      // 更新所有蓝牙指示器的状态
      this.elements.forEach(element => {
        if (element.eleType === 'bluetooth') {
          element.set('fill', status ? '#ffffff' : '#666666')
          baseStore.canvas.renderAll()
        }
      })
    },

    // 编码配置
    encodeConfig(element) {
      if (!element) {
        console.error('蓝牙元素对象无效')
        return null
      }
      
      try {
        console.log('编码蓝牙元素配置:', {
          left: element.left,
          top: element.top,
          fontSize: element.fontSize,
          fontFamily: element.fontFamily,
          color: element.fill
        })
        
        return {
          type: 'bluetooth',
          left: element.left,
          top: element.top,
          fontSize: element.fontSize,
          fontFamily: element.fontFamily || 'SuperIcons',
          color: element.fill
        }
      } catch (error) {
        console.error('编码蓝牙元素配置时出错:', error)
        return null
      }
    },

    // 解码配置
    decodeConfig(config) {
      return {
        left: config.left,
        top: config.top,
        fontSize: config.fontSize,
        fontFamily: config.fontFamily,
        color: config.color
      }
    }
  }
})
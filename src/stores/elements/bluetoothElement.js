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

      const options = {
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
      }
      console.log('bluetooth options', options)
      // 创建蓝牙图标
      const bluetoothIcon = new FabricText('\u0022', options)

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
  }
})
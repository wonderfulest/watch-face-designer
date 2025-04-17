import { defineStore } from 'pinia'
import { useBaseStore } from '../baseStore'
import { useLayerStore } from '../layerStore'

import { nanoid } from 'nanoid'
import { FabricText } from 'fabric'
import { getMetricBySymbol } from '@/config/settings'
export const useIconStore = defineStore('iconElement', {
  state: () => {
    const baseStore = useBaseStore()
    const layerStore = useLayerStore()

    return {
      baseStore,
      layerStore,
      baseStore
    }
  },

  actions: {
    async addElement(options = {}) {
      if (!this.baseStore.canvas) {
        throw new Error('画布未初始化，无法添加文本元素')
      }
      try {
        const elementId = nanoid()
        const metric = getMetricBySymbol(options.metricSymbol)
        if (!metric) {
          throw new Error('未找到指标配置')
        }
        const iconOptions = {
          id: elementId,
          eleType: 'icon',
          left: options.left,
          top: options.top,
          fontSize: Number(options.fontSize),
          fill: options.fill,
          fontFamily: options.iconFontFamily,
          originX: options.originX, // 使用 originX 控制对齐方式
          originY: 'center',
          selectable: true,
          hasControls: true,
          hasBorders: true,
          metricGroup: options.metricGroup,
          metricSymbol: metric.metricSymbol,
          varName: options.varName,
        }

        // 创建文本对象
        const element = new FabricText(metric.icon, iconOptions)

        // 添加到画布
        this.baseStore.canvas.add(element)

        // 添加到图层
        this.layerStore.addLayer(element)

        // 渲染画布
        this.baseStore.canvas.renderAll()

        // 设置为当前选中对象
        this.baseStore.canvas.discardActiveObject()
        this.baseStore.canvas.setActiveObject(element)

        return element
      } catch (error) {
        console.error('创建文本元素失败:', error)
        throw error
      }
    }
  }
})

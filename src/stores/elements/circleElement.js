import { defineStore } from 'pinia'
import { useBaseStore } from '../baseStore'
import { useLayerStore } from '../layerStore'
import { useBaseElementStore } from './baseElement'
import { nanoid } from 'nanoid'
import { Circle } from 'fabric'

export const useCircleStore = defineStore('circleElement', {
  state: () => {
    const baseStore = useBaseStore()
    const layerStore = useLayerStore()
    const baseElement = useBaseElementStore()

    return {
      baseStore,
      layerStore,
      baseElement
    }
  },

  actions: {
    async addElement(options = {}) {
      if (!this.baseStore.canvas) {
        throw new Error('画布未初始化，无法添加圆形元素')
      }

      try {
        const circleOptions = {
          id: nanoid(),
          eleType: 'circle',
          left: options.left,
          top: options.top,
          fill: options.fill,
          radius: options.radius,
          originX: 'center',
          originY: 'center',
          stroke: options.stroke,
          strokeWidth: options.strokeWidth,
          selectable: true,
          hasControls: true, // 启用控件
          lockScalingFlip: true // 防止对象翻转
        }

        const circle = new Circle(circleOptions)

        // 添加到画布
        this.baseStore.canvas.add(circle)

        // 添加到图层
        this.layerStore.addLayer(circle)

        // 渲染画布
        this.baseStore.canvas.renderAll()

        // 设置为当前选中对象
        this.baseStore.canvas.setActiveObject(circle)

        return circle
      } catch (error) {
        console.error('创建圆形元素失败:', error)
        throw error
      }
    },
    encodeConfig(element) {
      if (!element) {
        throw new Error('无效的元素')
      }
      return {
        type: 'circle',
        x: Math.round(element.left),
        y: Math.round(element.top),
        originX: element.originX,
        originY: element.originY,
        color: element.fill,
        radius: element.radius,
        stroke: element.stroke,
        strokeWidth: element.strokeWidth
      }
    },
    decodeConfig(config) {
      const decodedConfig = {
        left: config.x,
        top: config.y,
        fill: config.color,
        radius: config.radius,
        stroke: config.stroke,
        strokeWidth: config.strokeWidth,
        originX: config.originX,
        originY: config.originY
      }
      return decodedConfig
    }
  }
})

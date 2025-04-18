import { defineStore } from 'pinia'
import { Rect, Group } from 'fabric'
import { nanoid } from 'nanoid'
import { useBaseStore } from '@/stores/baseStore'
import { useLayerStore } from '@/stores/layerStore'

export const useProgressLineStore = defineStore('progressLineStore', {
  state: () => {
    const baseStore = useBaseStore()
    const layerStore = useLayerStore()

    return {
      progressLineElements: [],
      baseStore,
      layerStore
    }
  },

  actions: {
    async addElement(options = {}) {
      if (!this.baseStore.canvas) {
        throw new Error('画布未初始化，无法添加进度条元素')
      }

      try {
        const padding = Number(options.padding ?? 2)
        const progressAlign = options.progressAlign || 'left'
        const borderWidth = Number(options.borderWidth ?? 0)
        const borderColor = options.borderColor || '#FFFFFF'
        
        // 创建进度条背景
        const background = new Rect({
          id: `${nanoid()}_background`,
          left: Number(options.left) || 0,
          top: Number(options.top) || 0,
          width: Number(options.width) || 200,
          height: Number(options.height) || 10,
          fill: options.bgColor || '#333333',
          rx: Number(options.borderRadius) || 5,
          ry: Number(options.borderRadius) || 5,
          originX: 'center',
          originY: 'center',
          stroke: borderColor,
          strokeWidth: borderWidth
        })

        // 创建进度条前景（实际进度）
        const progress = new Rect({
          id: `${nanoid()}_progress`,
          left: this.getProgressLeft(background, padding, progressAlign, options.progress || 0),
          top: background.top,
          width: (background.width - padding * 2) * (options.progress || 0),
          height: background.height - padding * 2,
          fill: options.color || '#00FF00',
          rx: Math.max(0, background.rx - padding),
          ry: Math.max(0, background.ry - padding),
          originX: progressAlign,
          originY: 'center'
        })

        // 创建组
        const group = new Group([background, progress], {
          id: nanoid(),
          eleType: 'progressLine',
          left: Number(options.left) || 0,
          top: Number(options.top) || 0,
          selectable: true,
          hasControls: true,
          hasBorders: true,
          originX: 'center',
          originY: 'center',
          metricGroup: options.metricGroup,
          metricSymbol: options.metricSymbol,
          varName: options.varName,
          progress: options.progress || 0,
          color: options.color || '#00FF00',
          bgColor: options.bgColor || '#333333',
          borderRadius: Number(options.borderRadius) || 5,
          padding: padding,
          progressAlign: progressAlign,
          borderWidth: borderWidth,
          borderColor: borderColor
        })

        // 添加到画布
        this.baseStore.canvas.add(group)
        this.layerStore.addLayer(group)
        
        // 渲染画布
        this.baseStore.canvas.renderAll()
        
        // 设置为当前选中对象
        this.baseStore.canvas.setActiveObject(group)

        return group
      } catch (error) {
        console.error('创建进度条元素失败:', error)
        throw error
      }
    },

    // 新增：计算进度条前景的左侧位置
    getProgressLeft(background, padding, progressAlign, progress) {
      switch (progressAlign) {
        case 'left':
          return background.left - background.width / 2 + padding
        case 'right':
          return background.left + background.width / 2 - padding - (background.width - padding * 2) * progress
        case 'center':
          const progressWidth = (background.width - padding * 2) * progress
          return background.left - progressWidth / 2
        default:
          return background.left - background.width / 2 + padding
      }
    },

    updateElement(element, options = {}) {
      if (!element || !element.getObjects) return

      const objects = element.getObjects()
      const background = objects.find(obj => obj.id.endsWith('_background'))
      const progress = objects.find(obj => obj.id.endsWith('_progress'))

      if (!background || !progress) return

      const padding = options.padding !== undefined ? Number(options.padding) : (element.padding || 2)
      const progressAlign = options.progressAlign || element.progressAlign || 'left'

      // 新增：更新边框
      if (options.borderWidth !== undefined || options.borderColor !== undefined) {
        const borderWidth = options.borderWidth !== undefined ? Number(options.borderWidth) : (element.borderWidth || 0)
        const borderColor = options.borderColor || element.borderColor || '#FFFFFF'
        
        element.borderWidth = borderWidth
        element.borderColor = borderColor
        
        background.set({
          stroke: borderColor,
          strokeWidth: borderWidth
        })
      }

      // 更新基本属性
      if (options.width !== undefined) {
        background.set('width', options.width)
        progress.set('width', (options.width - padding * 2) * element.progress)
      }

      if (options.height !== undefined) {
        background.set('height', options.height)
        progress.set('height', options.height - padding * 2)
      }

      if (options.borderRadius !== undefined) {
        background.set({
          rx: options.borderRadius,
          ry: options.borderRadius
        })
        progress.set({
          rx: Math.max(0, options.borderRadius - padding),
          ry: Math.max(0, options.borderRadius - padding)
        })
      }

      // 更新内边距和对齐方式
      if (options.padding !== undefined || options.progressAlign !== undefined) {
        element.padding = padding
        element.progressAlign = progressAlign
        progress.set({
          left: this.getProgressLeft(background, padding, progressAlign, element.progress),
          width: (background.width - padding * 2) * element.progress,
          height: background.height - padding * 2,
          rx: Math.max(0, background.rx - padding),
          ry: Math.max(0, background.ry - padding),
          originX: progressAlign
        })
      }

      // 更新颜色
      if (options.color !== undefined) {
        progress.set('fill', options.color)
        element.color = options.color
      }

      if (options.bgColor !== undefined) {
        background.set('fill', options.bgColor)
        element.bgColor = options.bgColor
      }

      // 更新进度
      if (options.progress !== undefined) {
        element.progress = options.progress
        progress.set({
          width: (background.width - padding * 2) * options.progress,
          left: this.getProgressLeft(background, padding, progressAlign, options.progress)
        })
      }

      // 更新数据相关属性
      if (options.metricGroup !== undefined) element.metricGroup = options.metricGroup
      if (options.metricSymbol !== undefined) element.metricSymbol = options.metricSymbol
      if (options.varName !== undefined) element.varName = options.varName

      element.setCoords()
      this.baseStore.canvas.renderAll()
    },

    encodeConfig(element) {
      if (!element) {
        throw new Error('无效的元素')
      }

      const objects = element.getObjects()
      const background = objects.find(obj => obj.id.endsWith('_background'))

      return {
        type: 'progressLine',
        x: element.left,
        y: element.top,
        width: background.width,
        height: background.height,
        color: element.color,
        bgColor: element.bgColor,
        borderRadius: element.borderRadius,
        progress: element.progress,
        padding: element.padding,
        originX: element.originX,
        originY: background.originY,
        metricGroup: element.metricGroup,
        metricSymbol: element.metricSymbol,
        varName: element.varName,
        borderWidth: element.borderWidth,
        borderColor: element.borderColor
      }
    },

    decodeConfig(config) {
      return {
        eleType: 'progressLine',
        left: config.x,
        top: config.y,
        width: config.width,
        height: config.height,
        color: config.color,
        bgColor: config.bgColor,
        borderRadius: config.borderRadius,
        progress: config.progress,
        padding: config.padding,
        originX: config.originX,
        originY: config.originY,
        metricGroup: config.metricGroup,
        metricSymbol: config.metricSymbol,
        varName: config.varName,
        borderWidth: config.borderWidth,
        borderColor: config.borderColor
      }
    }
  }
})

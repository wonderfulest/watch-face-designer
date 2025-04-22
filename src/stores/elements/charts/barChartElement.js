import { defineStore } from 'pinia'
import { useBaseStore } from '../../baseStore'
import { useLayerStore } from '../../layerStore'
import { Group, Line } from 'fabric'
import { nanoid } from 'nanoid'

export const useBarChartStore = defineStore('barChartElement', {
  state: () => {
    const baseStore = useBaseStore()
    const layerStore = useLayerStore()
    return {
      baseStore,
      layerStore,
      defaultColors: {
        color: '#ffffff',    // 线条颜色
        bgColor: '#000000'   // 背景颜色
      }
    }
  },

  actions: {
    addElement(config) {
      const id = nanoid()
      
      // 基础尺寸配置
      const width = config.width || 150
      const height = config.height || 50
      const pointCount = config.pointCount || 240
      const fillMissing = config.fillMissing !== undefined ? config.fillMissing : true
      const minY = config.minY
      const maxY = config.maxY

      // 样式配置
      const color = config.color || this.defaultColors.color
      const bgColor = config.bgColor || this.defaultColors.bgColor

      // 创建组
      const group = new Group([], {
        left: config.left,
        top: config.top,
        id,
        eleType: 'barChart',
        selectable: true,
        hasControls: true,
        hasBorders: true,
        originX: 'center',
        originY: 'center',
        width: width,
        height: height,
        color: color,
        bgColor: bgColor,
        pointCount: pointCount,
        fillMissing: fillMissing,
        minY: minY,
        maxY: maxY
      })

      // 创建背景
      const bgRect = new fabric.Rect({
        width: width,
        height: height,
        fill: bgColor,
        left: -width/2,
        top: -height/2,
        selectable: false,
        hasControls: false
      })
      group.add(bgRect)

      // 创建柱状图
      this.createBars(group, width, height, pointCount, color, fillMissing)

      // 强制组重新计算边界
      group.setCoords()

      // 添加到画布
      this.baseStore.canvas.add(group)
      
      // 确保位置正确设置
      group.set({
        left: config.left,
        top: config.top
      })
      group.setCoords()

      // 添加到图层
      this.layerStore.addLayer(group)

      // 渲染画布
      this.baseStore.canvas.renderAll()

      // 设置为当前选中对象
      this.baseStore.canvas.discardActiveObject()
      this.baseStore.canvas.setActiveObject(group)
    },

    createBars(group, width, height, pointCount, color, fillMissing) {
      const stepX = width / pointCount
      const data = this.generateSampleData(pointCount)

      // 计算数据范围
      const validData = data.filter(v => v !== null)
      const minY = Math.min(...validData) - 5
      const maxY = Math.max(...validData) + 5
      const rangeY = maxY - minY

      for (let i = 0; i < pointCount; i++) {
        const value = i < data.length ? data[i] : null
        const xPos = -width/2 + i * stepX

        if (value !== null) {
          const scaledY = ((value - minY) * (height - 2)) / rangeY
          const yTop = -height/2 + (height - scaledY)
          
          const bar = new Line([xPos, yTop, xPos, height/2], {
            stroke: color,
            strokeWidth: 1,
            selectable: false,
            hasControls: false
          })
          group.add(bar)
        } else if (fillMissing) {
          const missingBar = new Line([xPos, -height/2, xPos, height/2], {
            stroke: '#666666',
            strokeWidth: 1,
            selectable: false,
            hasControls: false
          })
          group.add(missingBar)
        }
      }
    },

    generateSampleData(count) {
      const data = []
      for (let i = 0; i < count; i++) {
        if (Math.random() > 0.1) { // 90% 的概率有数据
          data.push(Math.random() * 100)
        } else {
          data.push(null)
        }
      }
      return data
    },

    updateElement(element, config) {
      if (!this.baseStore.canvas) return
      const group = this.baseStore.canvas.getObjects().find((obj) => obj.id === element.id)
      if (!group || !group.getObjects) return

      // 保存当前位置
      const currentLeft = group.left
      const currentTop = group.top

      // 更新组的属性
      const updateProps = {
        width: config.width,
        height: config.height,
        color: config.color,
        bgColor: config.bgColor,
        pointCount: config.pointCount,
        fillMissing: config.fillMissing,
        minY: config.minY,
        maxY: config.maxY,
        originX: config.originX,
        originY: config.originY
      }

      // 过滤掉未定义的属性
      Object.keys(updateProps).forEach(key => {
        if (updateProps[key] !== undefined) {
          group.set(key, updateProps[key])
        }
      })

      // 重新创建所有条形
      group.remove(...group.getObjects())
      
      const width = config.width || group.width || 150
      const height = config.height || group.height || 50
      const pointCount = config.pointCount || group.pointCount || 240
      const color = config.color || group.color || this.defaultColors.color
      const bgColor = config.bgColor || group.bgColor || this.defaultColors.bgColor
      const fillMissing = config.fillMissing !== undefined ? config.fillMissing : group.fillMissing !== undefined ? group.fillMissing : true

      // 创建背景
      const bgRect = new fabric.Rect({
        width: width,
        height: height,
        fill: bgColor,
        left: -width/2,
        top: -height/2,
        selectable: false,
        hasControls: false
      })
      group.add(bgRect)

      // 创建柱状图
      this.createBars(group, width, height, pointCount, color, fillMissing)

      // 恢复位置
      if (config.left === undefined) {
        group.set('left', currentLeft)
      }
      if (config.top === undefined) {
        group.set('top', currentTop)
      }

      // 强制重新计算边界和渲染
      group.setCoords()
      this.baseStore.canvas.renderAll()
    },

    encodeConfig(element) {
      if (!element) {
        throw new Error('无效的元素')
      }

      return {
        type: 'barChart',
        x: Math.round(element.left),
        y: Math.round(element.top),
        width: Math.round(element.width),
        height: Math.round(element.height),
        color: element.color || this.defaultColors.color,
        bgColor: element.bgColor || this.defaultColors.bgColor,
        pointCount: element.pointCount || 240,
        fillMissing: element.fillMissing !== undefined ? element.fillMissing : true,
        minY: element.minY,
        maxY: element.maxY
      }
    },

    decodeConfig(config) {
      return {
        eleType: 'barChart',
        left: config.x,
        top: config.y,
        width: config.width,
        height: config.height,
        color: config.color || this.defaultColors.color,
        bgColor: config.bgColor || this.defaultColors.bgColor,
        pointCount: config.pointCount || 240,
        fillMissing: config.fillMissing !== undefined ? config.fillMissing : true,
        minY: config.minY,
        maxY: config.maxY
      }
    }
  }
}) 
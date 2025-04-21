import { defineStore } from 'pinia'
import { useBaseStore } from '../baseStore'
import { useLayerStore } from '../layerStore'
import { Group, Polygon } from 'fabric'
import { nanoid } from 'nanoid'

export const useMoveBarStore = defineStore('moveBarElement', {
  state: () => {
    const baseStore = useBaseStore()
    const layerStore = useLayerStore()
    return {
      baseStore,
      layerStore,
      defaultColors: {
        active: '#ffffff',    // 活动状态颜色
        inactive: '#555555'   // 非活动状态颜色
      }
    }
  },

  actions: {
    addElement(config) {
      console.log('addElement', config)
      const id = nanoid()
      
      // 基础尺寸配置
      const width = config.width || 150 // 总宽度
      const height = config.height || 10 // 高度
      const separator = config.separator || 6 // 分隔符宽度
      const level = config.level || 0 // 活动级别

      // 样式配置
      const activeColor = config.activeColor || config.color || this.defaultColors.active
      const inactiveColor = config.inactiveColor || config.bgColor || this.defaultColors.inactive

      // 计算每个条形的宽度
      const barWidth = this.getBarWidth(width, separator)
      
      // 创建组
      const group = new Group([], {
        left: config.left,
        top: config.top,
        id,
        eleType: 'moveBar',
        selectable: true,
        hasControls: true,
        hasBorders: true,
        originX: 'center',
        originY: 'center',
        width: width,
        height: height,
        strokeWidth: 1,
        stroke: '#666666',
        activeColor: activeColor,
        inactiveColor: inactiveColor,
        level: level
      })

      // 创建条形
      let barX = -width/2
      for (let i = 1; i <= 5; i++) {
        const isActive = i <= level
        const color = isActive ? activeColor : inactiveColor

        const points = this.createBarPoints(barX, -height/2, barWidth, height)
        const bar = new Polygon(points, {
          fill: color,
          stroke: '#666666',
          strokeWidth: 1,
          id: id + '_bar_' + i,
          originX: 'center',
          originY: 'center',
          selectable: false,
          hasControls: false
        })

        group.add(bar)
        barX += barWidth + separator
      }

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

    // 计算每个条形的宽度
    getBarWidth(totalWidth, separator) {
      const numBars = 5 // 固定5个箭头
      return (totalWidth - (numBars - 1) * separator) / numBars
    },

    // 创建箭头形状的点坐标
    createBarPoints(x, y, width, height) {
      const arrowHeadWidth = width * 0.4 // 箭头头部宽度占总宽度的40%
      
      return [
        { x: x, y: y }, // 左上
        { x: x + width - arrowHeadWidth, y: y }, // 箭头前上
        { x: x + width, y: y + height/2 }, // 箭头尖
        { x: x + width - arrowHeadWidth, y: y + height }, // 箭头前下
        { x: x, y: y + height }, // 左下
      ]
    },

    // 更新活动级别
    updateLevel(element, level) {
      if (!this.baseStore.canvas) return
      const group = this.baseStore.canvas.getObjects().find((obj) => obj.id === element.id)
      if (!group || !group.getObjects) return

      const objects = group.getObjects()
      const activeColor = element.activeColor || this.defaultColors.active
      const inactiveColor = element.inactiveColor || this.defaultColors.inactive

      objects.forEach((obj) => {
        if (obj.id.startsWith(element.id + '_bar_')) {
          const barIndex = parseInt(obj.id.split('_').pop())
          obj.set('fill', barIndex <= level ? activeColor : inactiveColor)
        }
      })

      this.baseStore.canvas.renderAll()
    },

    // 编码配置
    encodeConfig(element) {
      if (!element) {
        throw new Error('无效的元素')
      }

      const objects = element.getObjects()
      const firstBar = objects.find((obj) => obj.id.endsWith('_bar_1'))
      const secondBar = objects.find((obj) => obj.id.endsWith('_bar_2'))
      
      if (!firstBar || !secondBar) {
        throw new Error('无效的元素')
      }

      const width = Math.abs(secondBar.left - firstBar.left)
      const height = element.height
      const separator = Math.abs(secondBar.left - firstBar.left - width)

      return {
        type: 'moveBar',
        x: Math.round(element.left),
        y: Math.round(element.top),
        width: Math.round(element.width),
        height: Math.round(height),
        separator: Math.round(separator),
        activeColor: element.activeColor || this.defaultColors.active,
        inactiveColor: element.inactiveColor || this.defaultColors.inactive,
        level: element.level || 0
      }
    },

    // 解码配置
    decodeConfig(config) {
      return {
        eleType: 'moveBar',
        left: config.x,
        top: config.y,
        width: config.width,
        height: config.height,
        separator: config.separator,
        activeColor: config.activeColor || this.defaultColors.active,
        inactiveColor: config.inactiveColor || this.defaultColors.inactive,
        level: config.level || 0
      }
    },

    // 更新元素所有属性
    updateElement(element, config) {
      if (!this.baseStore.canvas) return
      const group = this.baseStore.canvas.getObjects().find((obj) => obj.id === element.id)
      if (!group || !group.getObjects) return

      // 保存当前位置
      const currentLeft = group.left
      const currentTop = group.top

      // 更新组的位置和属性
      const updateProps = {
        width: config.width,
        height: config.height,
        activeColor: config.activeColor || config.color,
        inactiveColor: config.inactiveColor || config.bgColor,
        level: config.level,
        originX: config.originX,
        originY: config.originY
      }

      // 只有在明确指定位置时才更新位置
      if (config.left !== undefined) updateProps.left = config.left
      if (config.top !== undefined) updateProps.top = config.top

      // 过滤掉未定义的属性
      Object.keys(updateProps).forEach(key => {
        if (updateProps[key] !== undefined) {
          group.set(key, updateProps[key])
        }
      })

      // 重新创建所有条形
      group.remove(...group.getObjects())
      
      const width = config.width || group.width || 150
      const height = config.height || group.height || 10
      const separator = config.separator || 6
      const level = config.level || group.level || 0
      const activeColor = config.activeColor || config.color || group.activeColor || this.defaultColors.active
      const inactiveColor = config.inactiveColor || config.bgColor || group.inactiveColor || this.defaultColors.inactive

      const barWidth = this.getBarWidth(width, separator)
      let barX = -width/2

      for (let i = 1; i <= 5; i++) {
        const isActive = i <= level
        const color = isActive ? activeColor : inactiveColor

        const points = this.createBarPoints(barX, -height/2, barWidth, height)
        const bar = new Polygon(points, {
          fill: color,
          stroke: '#666666',
          strokeWidth: 1,
          id: element.id + '_bar_' + i,
          originX: 'center',
          originY: 'center',
          selectable: false,
          hasControls: false
        })

        group.add(bar)
        barX += barWidth + separator
      }

      // 恢复原始位置（如果没有明确指定新位置）
      if (config.left === undefined) {
        group.set('left', currentLeft)
      }
      if (config.top === undefined) {
        group.set('top', currentTop)
      }

      group.set({
        left: config.left,
        top: config.top
      })
      // 强制重新计算边界和渲染
      group.setCoords()
      this.baseStore.canvas.renderAll()
    }
  }
}) 
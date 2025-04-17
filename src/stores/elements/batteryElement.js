import { defineStore } from 'pinia'
import { useBaseStore } from '../baseStore'
import { useLayerStore } from '../layerStore'
import { Rect, Group } from 'fabric'
import { nanoid } from 'nanoid'

export const useBatteryStore = defineStore('batteryElement', {
  state: () => {
    const baseStore = useBaseStore()
    const layerStore = useLayerStore()
    return {
      baseStore,
      layerStore
    }
  },

  actions: {
    addElement(config) {
      const id = nanoid()
      const width = config.width || 120
      const height = config.height || 60
      const headWidth = width * 0.08 // 电池头部宽度为总宽度的8%
      const headHeight = height * 0.5 // 电池头部高度为总高度的50%
      const padding = 5 // 电量条和外壳的间距
      const level = config.level || 0.5 // 默认50%电量

      // 电池外壳
      const batteryBody = new Rect({
        width: width,
        height: height,
        fill: 'transparent',
        stroke: config.color || '#333',
        strokeWidth: 2,
        rx: height * 0.1, // 圆角
        ry: height * 0.1,
        id: id + '_body',
        originX: 'center',
        originY: 'center'
      })

      // 电池正极（突出的头部）
      const batteryHead = new Rect({
        width: headWidth,
        height: headHeight,
        fill: config.color || '#333',
        rx: headWidth * 0.2,
        ry: headWidth * 0.2,
        id: id + '_head',
        originX: 'center',
        originY: 'center',
        left: width / 2 + headWidth / 2
      })

      // 电池电量
      const batteryLevel = new Rect({
        width: (width - padding * 2) * level,
        height: height - padding * 2,
        fill: this.getLevelColor(level),
        id: id + '_level',
        originX: 'left',
        originY: 'center',
        left: -width / 2 + padding
      })

      // 创建组
      const group = new Group([batteryBody, batteryHead, batteryLevel], {
        left: config.left,
        top: config.top,
        id: id,
        eleType: 'battery',
        selectable: true,
        hasControls: true,
        hasBorders: true,
        originX: 'center',
        originY: 'center',
        metricGroup: config.metricGroup,
        metricSymbol: config.metricSymbol,
        varName: config.varName,
      })

      // 强制组重新计算边界
      group.setCoords()

      // 添加到画布
      this.baseStore.canvas.add(group)

      // 添加到图层
      this.layerStore.addLayer(group)

      // 渲染画布
      this.baseStore.canvas.renderAll()

      // 设置为当前选中对象
      this.baseStore.canvas.discardActiveObject()
      this.baseStore.canvas.setActiveObject(group)
    },

    // 根据电量获取颜色
    getLevelColor(level) {
      if (level <= 0.2) return '#ff3d00' // 红色，电量低
      if (level <= 0.5) return '#ffd600' // 黄色，电量中等
      return '#76ff03' // 绿色，电量充足
    },

    // 更新电池电量
    updateLevel(element, level) {
      if (!this.baseStore.canvas) return
      const group = this.baseStore.canvas.getObjects().find((obj) => obj.id === element.id)
      if (!group || !group.getObjects) return

      const objects = group.getObjects()
      const batteryLevel = objects.find((obj) => obj.id === element.id + '_level')
      const batteryBody = objects.find((obj) => obj.id === element.id + '_body')

      if (!batteryLevel || !batteryBody) return

      const padding = 5
      const width = batteryBody.width

      // 更新电量条宽度和颜色
      batteryLevel.set({
        width: (width - padding * 2) * level,
        fill: this.getLevelColor(level)
      })

      this.baseStore.canvas.renderAll()
    },

    // 编码配置
    encodeConfig(element) {
      if (!element) {
        throw new Error('无效的元素')
      }
      const objects = element.getObjects()
      const batteryBody = objects.find((obj) => obj.id.endsWith('_body'))
      const batteryLevel = objects.find((obj) => obj.id.endsWith('_level'))
      
      if (!batteryBody || !batteryLevel) {
        throw new Error('无效的元素')
      }

      const padding = 5
      const level = (batteryLevel.width + padding * 2) / batteryBody.width

      return {
        type: 'battery',
        x: Math.round(element.left),
        y: Math.round(element.top),
        width: batteryBody.width,
        height: batteryBody.height,
        color: batteryBody.stroke,
        level: level,
        metricGroup: element.metricGroup,
        metricSymbol: element.metricSymbol,
        varName: element.varName
      }
    },

    // 解码配置
    decodeConfig(config) {
      return {
        left: config.x,
        top: config.y,
        width: config.width,
        height: config.height,
        color: config.color,
        level: config.level,
        metricGroup: config.metricGroup,
        metricSymbol: config.metricSymbol,
        varName: config.varName
      }
    }
  }
}) 
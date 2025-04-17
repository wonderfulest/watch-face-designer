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
      console.log('addElement', config)
      const id = nanoid()
      
      // 基础尺寸配置
      const width = config.width || 120
      const height = config.height || 60
      const headWidth = config.headWidth || width * 0.08
      const headHeight = config.headHeight || height * 0.5
      const padding = config.padding || 5
      const level = config.level || 0.5
      const headGap = config.headGap || 2 // 默认间距为2

      // 样式配置
      const bodyStrokeWidth = config.bodyStrokeWidth || 2
      const bodyStroke = config.bodyStroke || '#333'
      const bodyFill = config.bodyFill || 'transparent'
      const bodyRx = config.bodyRx || height * 0.1
      const bodyRy = config.bodyRy || height * 0.1
      
      const headFill = config.headFill || bodyStroke
      const headRx = config.headRx || headWidth * 0.2
      const headRy = config.headRy || headWidth * 0.2

      // 电池外壳
      const batteryBody = new Rect({
        width,
        height,
        fill: bodyFill,
        stroke: bodyStroke,
        strokeWidth: bodyStrokeWidth,
        rx: bodyRx,
        ry: bodyRy,
        id: id + '_body',
        originX: 'left',
        originY: 'center',
        left: -width/2
      })

      // 电池正极（突出的头部）
      const batteryHead = new Rect({
        width: headWidth,
        height: headHeight,
        fill: headFill,
        rx: headRx,
        ry: headRy,
        id: id + '_head',
        originX: 'left',
        originY: 'center',
        left: width/2 + headGap // 加上间距
      })

      // 电池电量
      const batteryLevel = new Rect({
        width: (width - padding * 2) * level,
        height: height - padding * 2,
        fill: config.levelColor || this.getLevelColor(level),
        id: id + '_level',
        originX: 'left',
        originY: 'center',
        left: -width/2 + padding
      })

      // 创建组
      const group = new Group([batteryBody, batteryHead, batteryLevel], {
        left: config.left,
        top: config.top,
        id,
        eleType: 'battery',
        selectable: true,
        hasControls: true,
        hasBorders: true,
        originX: 'center',
        originY: 'center',
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
      const batteryHead = objects.find((obj) => obj.id.endsWith('_head'))
      const batteryLevel = objects.find((obj) => obj.id.endsWith('_level'))
      
      if (!batteryBody || !batteryHead || !batteryLevel) {
        throw new Error('无效的元素')
      }

      const padding = batteryLevel.left + batteryBody.width / 2
      const headGap = batteryHead.left - (batteryBody.left + batteryBody.width)

      return {
        type: 'battery',
        x: Math.round(element.left),
        y: Math.round(element.top),
        width: batteryBody.width,
        height: batteryBody.height,
        bodyStroke: batteryBody.stroke,
        bodyFill: batteryBody.fill,
        bodyStrokeWidth: batteryBody.strokeWidth,
        bodyRx: batteryBody.rx,
        bodyRy: batteryBody.ry,
        headWidth: batteryHead.width,
        headHeight: batteryHead.height,
        headFill: batteryHead.fill,
        headRx: batteryHead.rx,
        headRy: batteryHead.ry,
        padding: padding,
        level: batteryLevel.width / (batteryBody.width - padding * 2),
        levelColor: batteryLevel.fill,
        headGap: headGap,
      }
    },

    // 解码配置
    decodeConfig(config) {
      return {
        eleType: 'battery',
        left: config.x,
        top: config.y,
        width: config.width,
        height: config.height,
        bodyStroke: config.bodyStroke,
        bodyFill: config.bodyFill,
        bodyStrokeWidth: config.bodyStrokeWidth,
        bodyRx: config.bodyRx,
        bodyRy: config.bodyRy,
        headWidth: config.headWidth,
        headHeight: config.headHeight,
        headFill: config.headFill,
        headRx: config.headRx,
        headRy: config.headRy,
        padding: config.padding,
        level: config.level,
        levelColor: config.levelColor,
        headGap: config.headGap || 2,
      }
    },

    // 更新电池所有属性
    updateElement(element, config) {
      if (!this.baseStore.canvas) return
      const group = this.baseStore.canvas.getObjects().find((obj) => obj.id === element.id)
      if (!group || !group.getObjects) return

      const objects = group.getObjects()
      const batteryBody = objects.find((obj) => obj.id.endsWith('_body'))
      const batteryHead = objects.find((obj) => obj.id.endsWith('_head'))
      const batteryLevel = objects.find((obj) => obj.id.endsWith('_level'))

      if (!batteryBody || !batteryHead || !batteryLevel) return

      // 更新电池主体
      batteryBody.set({
        width: config.width,
        height: config.height,
        fill: config.bodyFill,
        stroke: config.bodyStroke,
        strokeWidth: config.bodyStrokeWidth,
        rx: config.bodyRx,
        ry: config.bodyRy,
        originX: 'left',
        originY: 'center',
        left: -config.width/2
      })

      // 更新电池头部
      batteryHead.set({
        width: config.headWidth,
        height: config.headHeight,
        fill: config.headFill,
        rx: config.headRx,
        ry: config.headRy,
        originX: 'left',
        originY: 'center',
        left: config.width/2 + (config.headGap || 2) // 加上间距
      })

      // 更新电量条
      const padding = config.padding || 5
      batteryLevel.set({
        width: (config.width - padding * 2) * config.level,
        height: config.height - padding * 2,
        fill: config.levelColor || this.getLevelColor(config.level),
        originX: 'left',
        originY: 'center',
        left: -config.width/2 + padding
      })

      // 更新组的位置
      if (config.left !== undefined) group.set('left', config.left)
      if (config.top !== undefined) group.set('top', config.top)

      // 强制重新计算边界和渲染
      group.setCoords()
      this.baseStore.canvas.renderAll()
    }
  }
}) 
import { defineStore } from 'pinia'
import { useBaseStore } from '../baseStore'
import { useLayerStore } from '../layerStore'

import { Circle, Group } from 'fabric'
import { nanoid } from 'nanoid'

export const useProgressRingStore = defineStore('progressRingElement', {
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
      const startAngle = config.startAngle
      const endAngle = config.endAngle
      const radius = config.radius
      const strokeWidth = config.strokeWidth // 描边的宽度，它会平均分布在圆的边缘内外两侧。也就是说，描边会向内和向外各扩展一半。
      const color = config.color
      const bgColor = config.bgColor
      const counterClockwise = config.counterClockwise
      const middleAngle = this.getMiddleAngle(startAngle, endAngle, counterClockwise, 0.333)
      // Create the main progress ring
      const mainRing = new Circle({
        radius: radius,
        fill: 'transparent',
        stroke: color,
        strokeWidth: strokeWidth,
        startAngle: startAngle,
        endAngle: middleAngle,
        id: id + '_main',
        originX: 'center',
        originY: 'center',
        counterClockwise: counterClockwise
      })

      // Create the background ring
      const bgRing = new Circle({
        radius: radius,
        fill: 'transparent',
        stroke: bgColor,
        strokeWidth: strokeWidth,
        startAngle: middleAngle,
        endAngle: endAngle,
        id: id + '_bg',
        originX: 'center',
        originY: 'center',
        counterClockwise: counterClockwise
      })

      // 计算组的初始尺寸
      const size = (radius + strokeWidth / 2) * 2

      // Create a group containing both rings
      const group = new Group([mainRing, bgRing], {
        left: config.left,
        top: config.top,
        width: size,
        height: size,
        id: id,
        eleType: 'progressRing',
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

      // Add the group to the canvas
      this.baseStore.canvas.add(group)

      // 添加到图层
      this.layerStore.addLayer(group)

      // 渲染画布
      this.baseStore.canvas.renderAll()

      // 设置为当前选中对象
      this.baseStore.canvas.discardActiveObject()
      this.baseStore.canvas.setActiveObject(group)
    },
    /**
     * 计算两个角度之间的中间角度
     * @param {*} startAngle 起始角度
     * @param {*} endAngle 结束角度
     * @param {*} counterClockwise 是否逆时针
     * @param {*} progress 进度
     * @returns 中间角度
     */
    getMiddleAngle(startAngle, endAngle, counterClockwise = false, progress = 0.333) {
      // 确保角度在0-360范围内
      startAngle = ((startAngle % 360) + 360) % 360
      endAngle = ((endAngle % 360) + 360) % 360

      // 顺时针和逆时针的处理不同
      if (counterClockwise === false) { // 顺时针
        // 如果结束角度小于起始角度，加360度
        if (endAngle < startAngle) {
          endAngle += 360
        }
        // 计算完成 1/3 的角度
        let middleAngle = startAngle + (endAngle - startAngle) * progress
        // 确保结果在0-360范围内
        return ((middleAngle % 360) + 360) % 360
      } else { // 逆时针
        // 如果结束角度大于起始角度，减360度
        if (endAngle > startAngle) {
          endAngle -= 360
        }
        // 计算完成 1/3 的角度（反向）
        let middleAngle = startAngle + (endAngle - startAngle) * progress
        // 确保结果在0-360范围内
        return ((middleAngle % 360) + 360) % 360
      }
    },
    /**
     * 计算两个角度之间的差值
     * @param {*} startAngle 起始角度
     * @param {*} endAngle 结束角度
     * @param {*} counterClockwise 是否逆时针
     * @returns 角度差值
     */
    getFullAngle(startAngle, endAngle, counterClockwise) {
      if (counterClockwise == null) {
        throw new Error('counterClockwise is null')
      }
      // 确保角度在0-360范围内
      startAngle = ((startAngle % 360) + 360) % 360
      endAngle = ((endAngle % 360) + 360) % 360

      if (counterClockwise === false) { // 顺时针
        // 计算角度差
        let angleDiff = endAngle - startAngle
        // 如果角度差为负，加360度
        if (angleDiff < 0) {
          angleDiff += 360
        }
        return angleDiff
      } else { // 逆时针
        // 计算角度差
        let angleDiff = startAngle - endAngle
        // 如果角度差为负，加360度
        if (angleDiff < 0) {
          angleDiff += 360
        }
        return angleDiff
      }
    },
    /**
     * 更新进度
     * @param {*} element 元素
     * @param {*} progress 进度
     */
    updateProgress(element, progress) {
      if (!this.baseStore.canvas) return
      const group = this.baseStore.canvas.getObjects().find((obj) => obj.id === element.id)
      if (!group || !group.getObjects) return

      const objects = group.getObjects()
      const mainRing = objects.find((obj) => obj.id === element.id + '_main')
      const bgRing = objects.find((obj) => obj.id === element.id + '_bg')

      if (!mainRing || !bgRing) return

      const startAngle = mainRing.startAngle
      const endAngle = bgRing.endAngle
      const middleAngle = this.getMiddleAngle(startAngle, endAngle, mainRing.counterClockwise, progress)

      mainRing.set('endAngle', middleAngle)
      bgRing.set('startAngle', middleAngle)

      this.baseStore.canvas.renderAll()
    },
    encodeConfig(element) {
      const progressRingStore = useProgressRingStore() 
      const mainRing = element.getObjects().find((obj) => obj.id.endsWith('_main'))
      const bgRing = element.getObjects().find((obj) => obj.id.endsWith('_bg'))
      if (!mainRing || !bgRing) {
        throw new Error('无效的元素')
      }
      return {
        type: 'progressRing',
        x: Math.round(element.left),
        y: Math.round(element.top),
        startAngle: mainRing.startAngle,
        endAngle: bgRing.endAngle,
        radius: mainRing.radius,
        strokeWidth: mainRing.strokeWidth,
        color: mainRing.stroke,
        bgColor: bgRing.stroke,
        metricGroup: element.metricGroup,
        metricSymbol: element.metricSymbol,
        fullAngle: progressRingStore.getFullAngle(mainRing.startAngle, bgRing.endAngle, mainRing.counterClockwise), // 不需要反序列化
        varName: element.varName,
        counterClockwise: mainRing.counterClockwise
      }
    },
    decodeConfig(config) {
      return {
        eleType: 'progressRing',
        left: config.x,
        top: config.y,
        startAngle: config.startAngle,
        endAngle: config.endAngle,
        radius: config.radius,
        strokeWidth: config.strokeWidth,
        color: config.color,
        bgColor: config.bgColor,
        metricGroup: config.metricGroup,
        metricSymbol: config.metricSymbol,
        varName: config.varName,
        counterClockwise: config.counterClockwise  
      }
    }
  }
})

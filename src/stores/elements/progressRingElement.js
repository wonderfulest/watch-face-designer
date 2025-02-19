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

      // Create the main progress ring
      const mainRing = new Circle({
        radius: radius,
        fill: 'transparent',
        stroke: color,
        strokeWidth: strokeWidth,
        startAngle: startAngle,
        endAngle: this.getMiddleAngle(startAngle, endAngle),
        id: id + '_main',
        originX: 'center',
        originY: 'center'
      })

      // Create the background ring
      const bgRing = new Circle({
        radius: radius,
        fill: 'transparent',
        stroke: bgColor,
        strokeWidth: strokeWidth,
        startAngle: this.getMiddleAngle(startAngle, endAngle),
        endAngle: endAngle,
        id: id + '_bg',
        originX: 'center',
        originY: 'center'
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
        colorVarName: config.colorVarName,
        bgColorVarName: config.bgColorVarName,
      })

      // 强制组重新计算边界
      group.setCoords()

      // Add the group to the canvas
      this.baseStore.canvas.add(group)

      // 添加到图层
      this.layerStore.addLayer(group);

      // 渲染画布
      this.baseStore.canvas.renderAll();

      // 设置为当前选中对象
      this.baseStore.canvas.discardActiveObject();
      this.baseStore.canvas.setActiveObject(group);
    },
    getMiddleAngle(startAngle, endAngle) {
      // 确保角度在0-360范围内
      startAngle = (startAngle % 360 + 360) % 360;
      endAngle = (endAngle % 360 + 360) % 360;
      
      // 如果结束角度小于起始角度，加360度
      if (endAngle < startAngle) {
        endAngle += 360;
      }
      
      // 计算完成 1/2 的角度
      let middleAngle = startAngle + (endAngle - startAngle) / 3.0;

      // 确保结果在0-360范围内
      return (middleAngle % 360 + 360) % 360;
    },
    getFullAngle(startAngle, endAngle) {
      // 确保角度在0-360范围内
      startAngle = (startAngle % 360 + 360) % 360;
      endAngle = (endAngle % 360 + 360) % 360;
      
      // 计算角度差
      let angleDiff = endAngle - startAngle;
      
      // 如果角度差为负，加360度
      if (angleDiff < 0) {
        angleDiff += 360;
      }
      
      return angleDiff;
    },
    updateProgress(element, progress) {
      const { baseStore } = this.baseElementStore
      if (!baseStore.canvas) return

      const group = baseStore.canvas.getObjects().find(obj => obj.id === element.id)
      if (!group || !group.getObjects) return

      const objects = group.getObjects()
      const mainRing = objects.find(obj => obj.id === element.id + '_main')
      const bgRing = objects.find(obj => obj.id === element.id + '_bg')

      if (!mainRing || !bgRing) return

      const startAngle = mainRing.startAngle
      const endAngle = bgRing.endAngle
      const middleAngle = this.getMiddleAngle(startAngle, endAngle)

      mainRing.set('endAngle', middleAngle)
      bgRing.set('startAngle', middleAngle)

      this.baseStore.canvas.renderAll()
    },
    encodeConfig(element) {
      if (!element) {
        throw new Error('无效的元素');
      }
      const mainRing = element.getObjects().find(obj => obj.id.endsWith('_main'))
      const bgRing = element.getObjects().find(obj => obj.id.endsWith('_bg'))
      if (!mainRing || !bgRing) {
        throw new Error('无效的元素');
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
        fullAngle: this.getFullAngle(mainRing.startAngle, bgRing.endAngle), // 不需要反序列化
        varName: element.varName,
        colorVarName: this.baseStore.getColorVarName(mainRing.stroke),
        bgColorVarName: this.baseStore.getColorVarName(bgRing.stroke),
      };
    },
    decodeConfig(config) {
      const decodedConfig = {
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
        colorVarName: config.colorVarName,
        bgColorVarName: config.bgColorVarName,
      };
      return decodedConfig;
    },
  }
})

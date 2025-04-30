import { defineStore } from 'pinia'
import { useBaseStore } from '@/stores/baseStore'
import { useLayerStore } from '@/stores/layerStore'
import { loadSVGFromURL, util } from 'fabric'
import { nanoid } from 'nanoid'
import hand1Svg from '@/assets/hands/hand1.svg?url'

export const useHourHandStore = defineStore('hourHandElement', {
  state: () => {
    const baseStore = useBaseStore()
    const layerStore = useLayerStore()
    return {
      baseStore,
      layerStore,
      defaultColors: {
        color: '#FFFFFF',
        bgColor: 'transparent'
      },
      defaultHeight: 150,
      defaultAngle: 0,
      defaultImage: hand1Svg,
      defaultRotationCenter: { x: 227, y: 227 }
    }
  },

  actions: {
    async addElement(config) {
      const id = nanoid()
      const height = Math.min(config.height || this.defaultHeight, 300)
      const angle = config.angle || this.defaultAngle
      const imageUrl = config.imageUrl || this.defaultImage
      const color = config.color || this.defaultColors.color
      const rotationCenter = config.rotationCenter || this.defaultRotationCenter

      const loadedSVG = await loadSVGFromURL(imageUrl)
      const svgGroup = util.groupSVGElements(loadedSVG.objects)
      const options = {
        id,
        eleType: 'hourHand',
        originX: 'center',
        originY: 'center',
        selectable: true,
        hasControls: true,
        hasBorders: true,
        angle: angle,
        imageUrl: imageUrl,
        color: color,
        rotationCenter: rotationCenter
      }
      svgGroup.set(options)

      if (Array.isArray(svgGroup._objects)) {
        svgGroup._objects.forEach((obj) => obj.set('fill', color))
      } else if (svgGroup.type === 'path') {
        svgGroup.set('fill', color)
      }

      svgGroup.scaleToHeight(height)

      // 计算自定义旋转中心后的 left/top
      const radians = util.degreesToRadians(angle)
      const dx = 0
      const dy = -height / 2
      const rotatedX = dx * Math.cos(radians) - dy * Math.sin(radians)
      const rotatedY = dx * Math.sin(radians) + dy * Math.cos(radians)

      svgGroup.set({
        left: rotationCenter.x + rotatedX,
        top: rotationCenter.y + rotatedY
      })

      this.baseStore.canvas.add(svgGroup)
      svgGroup.setCoords()
      this.layerStore.addLayer(svgGroup)
      this.baseStore.canvas.requestRenderAll()
      this.baseStore.canvas.discardActiveObject()
      this.baseStore.canvas.setActiveObject(svgGroup)
    },

    async updateElement(element, config) {
      if (!this.baseStore.canvas) return

      const svgGroup = this.baseStore.canvas.getObjects().find((obj) => obj.id === element.id)
      if (!svgGroup) return

      const currentHeight = Math.round(svgGroup.height * svgGroup.scaleY)
      const currentAngle = svgGroup.angle
      const currentImageUrl = svgGroup.imageUrl
      const rotationCenter = config.rotationCenter || svgGroup.rotationCenter || this.defaultRotationCenter

      let newSVG = svgGroup

      // 替换 image
      if (config.imageUrl && config.imageUrl !== currentImageUrl) {
        this.baseStore.canvas.remove(svgGroup)

        const loadedSVG = await loadSVGFromURL(config.imageUrl)
        newSVG = util.groupSVGElements(loadedSVG.objects)
        newSVG.set({
          id: element.id,
          eleType: 'hourHand',
          originX: 'center',
          originY: 'center',
          selectable: true,
          hasControls: true,
          hasBorders: true,
          angle: currentAngle,
          imageUrl: config.imageUrl
        })
        this.baseStore.canvas.add(newSVG)
      }

      // 应用颜色
      const colorToSet = config.color || newSVG.color || this.defaultColors.color
      if (Array.isArray(newSVG._objects)) {
        newSVG._objects.forEach((obj) => obj.set('fill', colorToSet))
      } else if (newSVG.type === 'path') {
        newSVG.set('fill', colorToSet)
      }
      newSVG.set({ color: colorToSet })

      // 调整尺寸
      if (config.height) {
        const targetHeight = Math.min(config.height, 300)
        newSVG.scaleToHeight(targetHeight)
      }

      // 计算旋转后位置
      const angle = config.angle !== undefined ? config.angle : currentAngle
      const height = config.height || currentHeight
      const radians = util.degreesToRadians(angle)
      const dx = 0
      const dy = -height / 2
      const rotatedX = dx * Math.cos(radians) - dy * Math.sin(radians)
      const rotatedY = dx * Math.sin(radians) + dy * Math.cos(radians)

      newSVG.set({
        left: rotationCenter.x + rotatedX,
        top: rotationCenter.y + rotatedY,
        angle: angle,
        imageUrl: config.imageUrl || newSVG.imageUrl,
        rotationCenter: rotationCenter
      })

      newSVG.setCoords()
      this.baseStore.canvas.requestRenderAll()
    },

    encodeConfig(element) {
      if (!element) throw new Error('无效的元素')
      return {
        type: 'hourHand',
        x: Math.round(element.left),
        y: Math.round(element.top),
        height: Math.round(element.height * element.scaleY),
        color: element.color,
        bgColor: element.bgColor,
        angle: element.angle,
        imageUrl: element.imageUrl,
        rotationCenter: element.rotationCenter
      }
    },

    decodeConfig(config) {
      return {
        eleType: 'hourHand',
        left: config.x,
        top: config.y,
        height: config.height,
        color: config.color,
        bgColor: config.bgColor,
        angle: config.angle,
        imageUrl: config.imageUrl,
        rotationCenter: config.rotationCenter
      }
    }
  }
})

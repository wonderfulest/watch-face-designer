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
      defaultImage: hand1Svg
    }
  },

  actions: {
    async addElement(config) {
      const id = nanoid()
      const height = Math.min(config.height || this.defaultHeight, 300)
      const angle = config.angle || this.defaultAngle
      const imageUrl = config.imageUrl || this.defaultImage
      const color = config.color || this.defaultColors.color

      const loadedSVG = await loadSVGFromURL(imageUrl)
      const svgGroup = util.groupSVGElements(loadedSVG.objects)
      const options = {
        id,
        eleType: 'hourHand',
        left: config.left,
        top: config.top,
        originX: 'center',
        originY: 'center',
        selectable: true,
        hasControls: true,
        hasBorders: true,
        angle: angle,
        imageUrl: imageUrl,
        color: color
      }
      svgGroup.set(options)

      if (Array.isArray(svgGroup._objects)) {
        svgGroup._objects.forEach((obj) => obj.set('fill', color))
      } else if (svgGroup.type === 'path') {
        svgGroup.set('fill', color)
      }

      svgGroup.scaleToHeight(height)
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

      const currentLeft = svgGroup.left
      const currentTop = svgGroup.top
      const currentAngle = svgGroup.angle
      const currentImageUrl = svgGroup.imageUrl
      
      let newSVG = svgGroup

      // 如果传入了新的 imageUrl，需要重新加载SVG
      if (config.imageUrl && config.imageUrl !== currentImageUrl) {
        this.baseStore.canvas.remove(svgGroup)

        const loadedSVG = await loadSVGFromURL(config.imageUrl)
        newSVG = util.groupSVGElements(loadedSVG.objects)
        newSVG.set({
          id: element.id,
          eleType: 'hourHand',
          left: currentLeft,
          top: currentTop,
          originX: 'center',
          originY: 'center',
          selectable: true,
          hasControls: true,
          hasBorders: true,
          angle: currentAngle,
          imageUrl: config.imageUrl,
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

      // 使用 scaleToHeight 调整尺寸
      if (config.height) {
        const targetHeight = Math.min(config.height, 300)
        newSVG.scaleToHeight(targetHeight)
      }

      console.log('updateElement angle', config.angle)
      // 应用位置、旋转
      newSVG.set({
        left: config.left !== undefined ? config.left : currentLeft,
        top: config.top !== undefined ? config.top : currentTop,
        angle: config.angle !== undefined ? config.angle : currentAngle,
        imageUrl: config.imageUrl || newSVG.imageUrl
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
        color: element.color ,
        bgColor: element.bgColor ,
        angle: element.angle ,
        imageUrl: element.imageUrl
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
        imageUrl: config.imageUrl
      }
    }
  }
})

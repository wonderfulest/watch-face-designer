import { defineStore } from 'pinia'
import { useBaseStore } from '@/stores/baseStore'
import { useLayerStore } from '@/stores/layerStore'
import { loadSVGFromURL, util } from 'fabric'
import { nanoid } from 'nanoid'
import { AnalogHandOptions } from '@/config/settings'
export const useMinuteHandStore = defineStore('minuteHand', {
  state: () => {
    const baseStore = useBaseStore()
    const layerStore = useLayerStore()
    return {
      baseStore,
      layerStore,
      handHeight: 150,
      moveDx: 0,
      moveDy: 0,
      defaultColors: {
        color: '#FFFFFF',
        bgColor: 'transparent'
      },
      defaultAngle: 0,
      defaultHand: AnalogHandOptions[0].url,
      defaultRotationCenter: { x: 227, y: 227 },
      updateTimer: null
    }
  },

  actions: {
    async addElement(config) {
      const id = nanoid()
      this.handHeight = Math.min(config.height || this.handHeight, 300)
      const angle = config.angle || this.defaultAngle
      const imageUrl = config.imageUrl || this.defaultHand
      const color = config.color || this.defaultColors.color
      const rotationCenter = config.rotationCenter || this.defaultRotationCenter

      const loadedSVG = await loadSVGFromURL(imageUrl)
      const svgGroup = util.groupSVGElements(loadedSVG.objects)
      const options = {
        id,
        eleType: 'minuteHand',
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

      if (config.moveDy) {
        this.moveDy = config.moveDy
      }
      if (Array.isArray(svgGroup._objects)) {
        svgGroup._objects.forEach((obj) => obj.set('fill', color))
      } else if (svgGroup.type === 'path') {
        svgGroup.set('fill', color)
      }

      svgGroup.scaleToHeight(this.handHeight)

      // 计算自定义旋转中心后的 left/top
      const radians = util.degreesToRadians(angle)
      const dx = 0
      const dy = -this.handHeight / 2 + this.moveDy
      const rotatedX = dx * Math.cos(radians) - dy * Math.sin(radians)
      const rotatedY = dx * Math.sin(radians) + dy * Math.cos(radians)

      svgGroup.set({
        left: rotationCenter.x + rotatedX,
        top: rotationCenter.y + rotatedY
      })

      // 添加移动事件监听
      svgGroup.on('moving', (e) => {
        const moveTop = e.transform.target.top
        const moveLeft = e.transform.target.left
        this.moveDy = moveTop + this.handHeight / 2 - this.baseStore.WATCH_SIZE / 2
        console.log('moveDy', this.moveDy)
      })

      this.baseStore.canvas.add(svgGroup)
      svgGroup.setCoords()
      this.layerStore.addLayer(svgGroup)
      this.baseStore.canvas.requestRenderAll()
      this.baseStore.canvas.discardActiveObject()
      this.baseStore.canvas.setActiveObject(svgGroup)

      this.startTimeUpdate()
    },

    async updateElement(element, config) {
      if (!this.baseStore.canvas) return

      const svgGroup = this.baseStore.canvas.getObjects().find((obj) => obj.id === element.id)
      if (!svgGroup) return

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
          eleType: 'minuteHand',
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
        this.handHeight = Math.min(config.height, 300)
        newSVG.scaleToHeight(this.handHeight)
      }

      // 计算旋转后位置
      const angle = config.angle !== undefined ? config.angle : currentAngle
      const radians = util.degreesToRadians(angle)
      const dx = 0
      const dy = -this.handHeight / 2 + this.moveDy
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

      if (!this.updateTimer) {
        this.startTimeUpdate()
      }
    },

    updateTime() {
      if (!this.baseStore.canvas) return
      
      const minuteHand = this.baseStore.canvas.getObjects().find(obj => obj.eleType === 'minuteHand')
      if (!minuteHand) return

      const now = new Date()
      const minutes = now.getMinutes()
      
      // 计算分针角度 (每分钟6度)
      const angle = minutes * 6
      
    },

    startTimeUpdate() {
      // 先执行一次更新
      this.updateTime()
      
      // 每分钟更新一次
      this.updateTimer = setInterval(() => {
        this.updateTime()
      }, 60000)
    },

    stopTimeUpdate() {
      if (this.updateTimer) {
        clearInterval(this.updateTimer)
        this.updateTimer = null
      }
    },

    encodeConfig(element) {
      if (!element) throw new Error('无效的元素')
      return {
        type: 'minuteHand',
        x: Math.round(element.left),
        y: Math.round(element.top),
        height: Math.round(element.height * element.scaleY),
        color: element.color,
        bgColor: element.bgColor,
        angle: element.angle,
        imageUrl: element.imageUrl,
        rotationCenter: element.rotationCenter,
        moveDy: this.moveDy,
        scaleY: element.scaleY
      }
    },

    decodeConfig(config) {
      return {
        eleType: 'minuteHand',
        left: config.x,
        top: config.y,
        height: config.height,
        color: config.color,
        bgColor: config.bgColor,
        angle: config.angle,
        imageUrl: config.imageUrl,
        rotationCenter: config.rotationCenter,
        moveDy: config.moveDy,
        scaleY: config.scaleY
      }
    }
  }
})
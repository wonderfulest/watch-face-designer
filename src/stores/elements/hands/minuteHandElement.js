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
      endPoint: {
        x: 227,
        y: 150
      },
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
    // 通用的旋转方法
    rotateHand(svgGroup, angle, rotationCenter, moveDy = 0) {
      const radians = util.degreesToRadians(angle)
      const dx = 0
      const dy = -this.handHeight / 2 + moveDy
      const rotatedX = dx * Math.cos(radians) - dy * Math.sin(radians)
      const rotatedY = dx * Math.sin(radians) + dy * Math.cos(radians)

      svgGroup.set({
        left: rotationCenter.x + rotatedX,
        top: rotationCenter.y + rotatedY,
        angle: angle
      })
      svgGroup.setCoords()
      this.baseStore.canvas.requestRenderAll()
    },

    getMinuteHandAngle(time) {
      const now = time || new Date()
      const minutes = now.getMinutes()
      const seconds = now.getSeconds()
      const angle = minutes * 6 + seconds * 0.1
      return angle
    },

    async addElement(config) {
      console.log('minuteHand addElement', config)
      const id = nanoid()
      this.handHeight = Math.min(config.height, 300)
      this.moveDy = config.moveDy || this.moveDy
      this.endPoint = {
        x: config.x || this.endPoint.x,
        y: config.y || this.endPoint.y
      }
      
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
        angle: 0,
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

      svgGroup.scaleToHeight(this.handHeight)

      // 使用通用的旋转方法
      const angle = this.getMinuteHandAngle()
      this.rotateHand(svgGroup, angle, rotationCenter, this.moveDy)

      // 添加移动事件监听
      svgGroup.on('moving', (e) => {
        console.log('minuteHand moving', e)
        this.endPoint = {
          x: e.transform.target.left,
          y: e.transform.target.top
        }
        this.moveDy = this.endPoint.y + this.handHeight / 2 - this.baseStore.WATCH_SIZE / 2
      })
      svgGroup.on('selected', (e) => {
        console.log('minuteHand selected', e)
        // 使用通用的旋转方法，设置角度为0（12点位置）
        this.rotateHand(svgGroup, 0, rotationCenter, this.moveDy)
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
      this.handHeight = config.height
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
        newSVG.scaleToHeight(this.handHeight)
        // 添加移动事件监听
        newSVG.on('moving', (e) => {
          this.endPoint = {
            x: e.transform.target.left,
            y: e.transform.target.top
          }
          const distance = this.endPoint.y + this.handHeight / 2 - this.baseStore.WATCH_SIZE / 2
          this.moveDy = distance
          console.log('minuteHand  updateElement moving', this.moveDy, e.transform.target.top)
        })
        newSVG.on('selected', (e) => {
          console.log('minuteHand  updateElement selected', e)
          // 使用通用的旋转方法，设置角度为0（12点位置）
          this.rotateHand(newSVG, 0, rotationCenter, this.moveDy)
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
      // 使用通用的旋转方法
      this.rotateHand(newSVG, angle, rotationCenter, this.moveDy)

      newSVG.setCoords()
      this.baseStore.canvas.requestRenderAll()

      if (!this.updateTimer) {
        this.startTimeUpdate()
      }
    },

    updateTime(time) {
      if (!this.baseStore.canvas) return
      
      const minuteHand = this.baseStore.canvas.getObjects().find(obj => obj.eleType === 'minuteHand')
      if (!minuteHand) return

      const angle = this.getMinuteHandAngle(time)
      // 使用通用的旋转方法
      this.rotateHand(minuteHand, angle, minuteHand.rotationCenter, this.moveDy)
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
        x: this.endPoint.x,
        y: this.endPoint.y,
        height: this.handHeight,
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
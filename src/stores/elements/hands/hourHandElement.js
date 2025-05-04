import { defineStore } from 'pinia'
import { useBaseStore } from '@/stores/baseStore'
import { useLayerStore } from '@/stores/layerStore'
import { loadSVGFromURL, util } from 'fabric'
import { nanoid } from 'nanoid'
import { AnalogHandOptions } from '@/config/settings'
export const useHourHandStore = defineStore('hourHandElement', {
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
        y: 180
      },
      defaultColors: {
        color: '#FFFFFF',
        bgColor: 'transparent'
      },
      defaultAngle: 0,
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

    getHourHandAngle(time) {
      const now = time || new Date()
      const hours = now.getHours()
      const minutes = now.getMinutes()
      const angle = (hours % 12) * 30 + minutes * 0.5
      return angle
    },

    async addElement(config) {
      console.log('hourHand addElement', config)
      const id = nanoid()
      this.handHeight = Math.min(config.height, 300)
      this.moveDy = config.moveDy || this.moveDy
      this.endPoint = {
        x: config.x || this.endPoint.x,
        y: config.y || this.endPoint.y
      }
    
      const imageUrl = config.imageUrl || AnalogHandOptions[0].url
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
        angle: 0,
        imageUrl: imageUrl,
        color: color,
        rotationCenter: rotationCenter
      }
      svgGroup.set(options)
      svgGroup.scaleToHeight(this.handHeight)

      if (Array.isArray(svgGroup._objects)) {
        svgGroup._objects.forEach((obj) => obj.set('fill', color))
      } else if (svgGroup.type === 'path') {
        svgGroup.set('fill', color)
      }
    
      // 使用通用的旋转方法
      const angle = this.getHourHandAngle()
      this.rotateHand(svgGroup, angle, rotationCenter, this.moveDy)

      // 添加移动事件监听
      svgGroup.on('moving', (e) => {
        console.log('hourHand moving', e)
        this.endPoint = {
          x: e.transform.target.left,
          y: e.transform.target.top
        }
        const distance = this.endPoint.y + this.handHeight / 2 - this.baseStore.WATCH_SIZE / 2
        this.moveDy = distance
        console.log('hourHand moving', this.moveDy, e.transform.target.top)
      })
      
      svgGroup.on('selected', (e) => {
        console.log('hourHand selected', e)
        // 使用通用的旋转方法，设置角度为0（12点位置）
        this.rotateHand(svgGroup, 0, rotationCenter, this.moveDy)
      })


      svgGroup.setCoords()

      this.baseStore.canvas.add(svgGroup)
      this.layerStore.addLayer(svgGroup)
      this.baseStore.canvas.requestRenderAll()
      this.baseStore.canvas.discardActiveObject()
      this.baseStore.canvas.setActiveObject(svgGroup)

      this.startTimeUpdate()
    },

    async updateElement(element, config) {
      console.log('rotation angle', config.angle)
      if (!this.baseStore.canvas) return

      const svgGroup = this.baseStore.canvas.getObjects().find((obj) => obj.id === element.id)
      if (!svgGroup) return

      const currentAngle = svgGroup.angle
      const currentImageUrl = svgGroup.imageUrl
      const rotationCenter = config.rotationCenter || svgGroup.rotationCenter || this.defaultRotationCenter
      console.log('hourHand updateElement rotationCenter', rotationCenter)
      let newSVG = svgGroup
      this.handHeight = config.height
      // 替换 image
      if (config.imageUrl && config.imageUrl !== currentImageUrl) {
        console.log('hourHand updateElement imageUrl', config.imageUrl)
        this.baseStore.canvas.remove(svgGroup)

        const loadedSVG = await loadSVGFromURL(config.imageUrl)
        console.log('hourHand updateElement loadedSVG', loadedSVG)
        newSVG = util.groupSVGElements(loadedSVG.objects)
        newSVG.set({
          id: element.id,
          eleType: 'hourHand',
          originX: 'center',
          originY: 'center',
          selectable: true,
          hasControls: true,
          hasBorders: true,
          angle: 0,
          imageUrl: config.imageUrl,
          color: config.color,
          rotationCenter: rotationCenter
        })
        // 添加移动事件监听
        newSVG.on('moving', (e) => {
          this.endPoint = {
            x: e.transform.target.left,
            y: e.transform.target.top
          }
          const distance = this.endPoint.y + this.handHeight / 2 - this.baseStore.WATCH_SIZE / 2
          this.moveDy = distance
          console.log('hourHand moving', this.moveDy, e.transform.target.top)
        })
        newSVG.on('selected', (e) => {
          console.log('hourHand  updateElement selected', e)
          // 使用通用的旋转方法，设置角度为0（12点位置）
          this.rotateHand(newSVG, 0, rotationCenter, this.moveDy)
        })
        this.baseStore.canvas.add(newSVG)
      }

      // 应用颜色
      const colorToSet = config.color || this.defaultColors.color
      if (Array.isArray(newSVG._objects)) {
        newSVG._objects.forEach((obj) => obj.set('fill', colorToSet))
        console.log('hourHand 111 updateElement colorToSet', colorToSet)
      } else if (newSVG.type === 'path') {
        newSVG.set('fill', colorToSet)
        console.log('hourHand 222 updateElement colorToSet', colorToSet)
      }
  
      newSVG.set({ color: colorToSet })

      // 调整尺寸
      this.handHeight = Math.min(config.height, 300)
      newSVG.scaleToHeight(this.handHeight)

      // 计算旋转后位置
      const angle = config.angle !== undefined ? config.angle : currentAngle
      console.log('hourHand updateElement angle', angle, rotationCenter, this.moveDy)
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
      
      const hourHand = this.baseStore.canvas.getObjects().find(obj => obj.eleType === 'hourHand')
      if (!hourHand) return

      const angle = this.getHourHandAngle(time)
      // 使用通用的旋转方法
      this.rotateHand(hourHand, angle, hourHand.rotationCenter, this.moveDy)
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
        type: 'hourHand',
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
        eleType: 'hourHand',
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

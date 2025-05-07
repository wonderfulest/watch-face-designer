import { defineStore } from 'pinia'
import { useBaseStore } from '@/stores/baseStore'
import { useLayerStore } from '@/stores/layerStore'
import { loadSVGFromURL, util } from 'fabric'
import { nanoid } from 'nanoid'
import { Ticks12Options } from '@/config/settings'
export const useTick12Store = defineStore('tick12Element', {
  state: () => {
    const baseStore = useBaseStore()
    const layerStore = useLayerStore()
    return {
      baseStore,
      layerStore,
      moveDx: 0,
      defaultColors: {
        color: '#FFFFFF',
        bgColor: 'transparent'
      },
      defaultAngle: 0,
      defaultTargetHeight: 180,
      defaultRotationCenter: { x: 227, y: 227 },
      updateTimer: null
    }
  },

  actions: {
    async addElement(config) {
      console.log('addElement tick 12', config)
      const id = nanoid()
      const imageUrl = config.imageUrl || Ticks12Options[0].url
      const fill = config.fill || this.defaultColors.color
      const rotationCenter = config.rotationCenter || this.defaultRotationCenter
      const targetHeight = Math.min(config.targetHeight || this.defaultTargetHeight, 300)
      const moveDy = config.moveDy || 0
      const loadedSVG = await loadSVGFromURL(imageUrl)
      const svgGroup = util.groupSVGElements(loadedSVG.objects)
      const options = {
        id,
        eleType: 'ticks12',
        originX: 'center',
        originY: 'center',
        selectable: true,
        hasControls: true,
        hasBorders: true,
        angle: 0,
        imageUrl: imageUrl,
        fill: fill,
        rotationCenter: rotationCenter, // 旋转中心
        targetHeight: targetHeight, // 指针高度
        targetScaleY: 1, // 缩放比例
        moveDy: moveDy, // 旋转中心在Y轴上偏移的距离
      }
      svgGroup.set(options)
      svgGroup.scaleToHeight(targetHeight)

      // 添加移动事件监听
      svgGroup.on('moving', (e) => {
        const y = e.transform.target.top // 获取指针中心位置的Y轴坐标
        const distance = y + svgGroup.targetHeight / 2 - rotationCenter.y
        svgGroup.set('moveDy', distance)
      })
      
      svgGroup.on('selected', (e) => {
        if (this.updateTimer) {
          this.stopTimeUpdate()
        }
        this.rotateHand(svgGroup, 0)
      })
      svgGroup.on('deselected', (e) => {
        console.log('hourHand deselected', svgGroup)
        if (!this.updateTimer) {
          this.startTimeUpdate()
        }
      })
      svgGroup.setCoords()
      this.baseStore.canvas.add(svgGroup)
      this.layerStore.addLayer(svgGroup)
      this.baseStore.canvas.requestRenderAll()
      this.baseStore.canvas.discardActiveObject()
      this.baseStore.canvas.setActiveObject(svgGroup)
    },
    async updateHandSVG(element, config) {
    },

    encodeConfig(element) {
      if (!element) throw new Error('无效的元素')
      return {
        type: 'ticks12',
        x: element.left,
        y: element.top,
        height: element.height,
        color: element.fill,
        angle: element.angle,
        imageUrl: element.imageUrl,
        targetHeight: element.targetHeight,
        rotationCenter: element.rotationCenter,
        moveDy: element.moveDy,
      }
    },

    decodeConfig(config) {
      return {
        eleType: 'ticks12',
        left: config.x,
        top: config.y,
        height: config.height,
        fill: config.color,
        angle: config.angle,
        imageUrl: config.imageUrl,
        targetHeight: config.targetHeight,
        rotationCenter: config.rotationCenter,
        moveDy: config.moveDy,
      }
    }
  }
})

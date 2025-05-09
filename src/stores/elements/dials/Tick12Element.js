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
    }
  },

  actions: {
    async addElement(options = {}) {
      console.log('addElement tick 12', options)
      const id = nanoid()
      const imageUrl = options.imageUrl || Ticks12Options[0].url
      const fill = options.fill || this.defaultColors.color
      const loadedSVG = await loadSVGFromURL(imageUrl)
      console.log('loadedSVG', loadedSVG)
      const svgGroup = util.groupSVGElements(loadedSVG.objects)
      svgGroup.set({
        id,
        eleType: 'tick12',
        left: options.left,
        top: options.top,
        originX: 'center',
        originY: 'center',
        selectable: true,
        hasControls: true,
        hasBorders: true,
        imageUrl: imageUrl,
        fill: fill,
      })
      svgGroup.getObjects().forEach(obj => {
        const currentFill = obj.get('fill')
        if (currentFill === 'white' || currentFill === '#FFFFFF') {
          obj.set('fill', 'none')
        } else if (currentFill && currentFill !== 'none') {
          obj.set('fill', fill)
        }
      })
      svgGroup.scaleToWidth(this.baseStore.WATCH_SIZE)
      // 添加移动事件监听
      svgGroup.on('moving', (e) => {
      })
      svgGroup.on('selected', (e) => {
      })
      svgGroup.on('deselected', (e) => {
      })
      svgGroup.setCoords()
      this.baseStore.canvas.add(svgGroup)
      this.layerStore.addLayer(svgGroup)
      this.baseStore.canvas.requestRenderAll()
      this.baseStore.canvas.discardActiveObject()
      this.baseStore.canvas.setActiveObject(svgGroup)
    },
    async updateElement(element, config) {
      console.log('updateElement tick 12', element, config)
      if (!element) throw new Error('无效的元素')
      if (config.fill) {
        element.set('fill', config.fill)
      }
      element.getObjects().forEach(obj => {
        const currentFill = obj.get('fill')
        if (currentFill && currentFill != 'none') {
          obj.set('fill', config.fill)
        }
      })
      element.setCoords()
      this.baseStore.canvas.requestRenderAll()
    },
    encodeConfig(element) {
      if (!element) throw new Error('无效的元素')
      return {
        type: 'tick12',
        x: element.left,
        y: element.top,
        height: element.height,
        color: element.fill,
        imageUrl: element.imageUrl,
      }
    },

    decodeConfig(config) {
      return {
        eleType: 'tick12',
        left: config.x,
        top: config.y,
        height: config.height,
        fill: config.color,
        imageUrl: config.imageUrl,
      }
    }
  }
})

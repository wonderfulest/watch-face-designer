import { defineStore } from 'pinia'
import { useBaseStore } from '../base'
import { useLayerStore } from '../layerStore'
import { useColorStore } from '../colorStore'
import { nanoid } from 'nanoid'
import { FabricText } from 'fabric'
import { getMetricBySymbol } from '@/config/settings'

export const useLabelStore = defineStore('labelElement', {
  state: () => {
    const baseStore = useBaseStore()
    const layerStore = useLayerStore()
    const colorStore = useColorStore()
    return {
      baseStore,
      layerStore,
      colorStore
    }
  },

  actions: {
    async addElement(options = {}) {
      if (!this.baseStore.canvas) {
        throw new Error('画布未初始化，无法添加标签元素')
      }

      try {
        const metric = getMetricBySymbol(options.metricSymbol)
        
        const labelOptions = {
          id: nanoid(),
          eleType: 'label',
          left: options.left,
          top: options.top,
          fontSize: options.fontSize,
          fill: options.fill,
          fontFamily: options.fontFamily,
          originX: options.originX,
          originY: options.originY,
          selectable: true,
          hasControls: true,
          hasBorders: true,
          metricGroup: options.metricGroup,
          metricSymbol: options.metricSymbol,
          text: metric ? metric.enLabel : 'Label',
          varName: options.varName,
          fillVarName: options.fillVarName,
        }
        console.log('创建标签元素', labelOptions)

        // 创建文本对象
        const element = new FabricText(labelOptions.text, labelOptions)

         // 添加到画布
         this.baseStore.canvas.add(element);

         // 添加到图层
         this.layerStore.addLayer(element);

         // 渲染画布
         this.baseStore.canvas.renderAll();

         // 设置为当前选中对象
         this.baseStore.canvas.discardActiveObject();
         this.baseStore.canvas.setActiveObject(element);

        return element
      } catch (error) {
        console.error('添加标签元素失败:', error)
        throw error
      }
    },

    encodeConfig(element) {
      return {
        id: element.id,
        type: element.eleType,
        x: Math.round(element.left),
        y: Math.round(element.top),
        size: element.fontSize,
        color: element.fill,
        font: element.fontFamily,
        originX: element.originX,
        originY: element.originY,
        metricGroup: element.metricGroup,
        metricSymbol: element.metricSymbol,
        text: element.text,
        varName: element.varName,
        fillVarName: this.colorStore.getColorVarName(element.fill),
      }
    },

    decodeConfig(config) {
      const decodedConfig = {
        ...config,
        left: config.x,
        top: config.y,
        fill: config.color,
        fontFamily: config.font,
        fontSize: config.size,
        originX: config.originX,
        originY: config.originY,
        metricGroup: config.metricGroup,
        metricSymbol: config.metricSymbol,
        text: config.text,
        varName: config.varName,
        fillVarName: config.fillVarName,
      }
      return decodedConfig
    }
  }
})

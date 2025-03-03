import { defineStore } from 'pinia'
import { FabricText } from 'fabric'
import { nanoid } from 'nanoid'
import { useBaseStore } from '../baseStore'
import { useLayerStore } from '../layerStore'

import { getMetricBySymbol } from '@/config/settings'

export const useDataStore = defineStore('dataStore', {
  state: () => {
    const baseStore = useBaseStore()
    const layerStore = useLayerStore()

    return {
      dataElements: [],
      baseStore,
      layerStore
    }
  },

  actions: {
    async addElement(options = {}) {
      if (!this.baseStore.canvas) {
        throw new Error('画布未初始化，无法添加文本元素')
      }
      try {
        const metric = getMetricBySymbol(options.metricSymbol)
        if (!metric) {
          throw new Error('data未找到指标配置')
        }
        const dataOptions = {
          eleType: 'data',
          id: nanoid(),
          left: Number(options.left),
          top: Number(options.top),
          fontSize: Number(options.fontSize),
          fill: options.fill,
          fontFamily: options.fontFamily,
          originX: options.originX,
          originY: options.originY,
          selectable: true,
          hasControls: false,
          hasBorders: true,
          metricGroup: options.metricGroup,
          metricSymbol: metric.metricSymbol,
          varName: options.varName, // 数据变量名字
          colorVarName: options.colorVarName // 填充变量名
        }
        // 创建文本对象
        const element = new FabricText(metric.defaultValue, dataOptions)

        // 添加到画布
        this.baseStore.canvas.add(element)

        this.layerStore.addLayer(element)

        // 渲染画布
        this.baseStore.canvas.renderAll()

        // 设置为当前选中对象
        this.baseStore.canvas.discardActiveObject()
        this.baseStore.canvas.setActiveObject(element)

        return element
      } catch (error) {
        console.error('创建文本元素失败:', error)
        throw error
      }
    },
    encodeConfig(element) {
      if (!element) {
        throw new Error('无效的元素')
      }
      const metric = getMetricBySymbol(element.metricSymbol)
      if (!metric) {
        throw new Error('data未找到指标配置')
      }
      return {
        type: 'data',
        x: Math.round(element.left), // 四舍五入
        y: Math.round(element.top), // 四舍五入
        metricGroup: element.metricGroup,
        metricSymbol: metric.metricSymbol,
        originX: element.originX,
        originY: element.originY,
        font: element.fontFamily,
        size: element.fontSize,
        color: element.fill,
        varName: element.varName,
        colorVarName: this.baseStore.getColorVarName(element.fill)
      }
    },
    decodeConfig(config) {
      const decodedConfig = {
        ...config,
        type: 'data',
        left: config.x,
        top: config.y,
        fill: config.color,
        fontFamily: config.font,
        fontSize: config.size,
        originX: config.originX,
        originY: config.originY,
        size: config.size,
        metricGroup: config.metricGroup,
        metricSymbol: config.metricSymbol,
        varName: config.varName,
        colorVarName: config.colorVarName
      }
      return decodedConfig
    }
  }
})

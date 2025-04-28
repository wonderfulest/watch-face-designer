import { defineStore } from 'pinia'
import { useBaseStore } from '@/stores/baseStore'
import { useLayerStore } from '@/stores/layerStore'
import { Group, Image, loadSVGFromURL, util } from 'fabric'
import { nanoid } from 'nanoid'
import hand1Svg from '@/assets/hands/hand1.svg'
import hand2Svg from '@/assets/hands/hand2.svg'
import hand3Svg from '@/assets/hands/hand3.svg'

export const useMinuteHandStore = defineStore('minuteHand', {
  state: () => {
    const baseStore = useBaseStore()
    const layerStore = useLayerStore()
    return {
      baseStore,
      layerStore,
      defaultColors: {
        color: '#FFFFFF',    // 默认白色
        bgColor: 'transparent'  // 透明背景
      },
      defaultWidth: 6,       // 默认宽度
      defaultLength: 50,     // 默认长度
      defaultRotation: 270,  // 默认旋转角度（12点钟方向）
      defaultImage: hand1Svg // 默认指针图片
    }
  },

  actions: {
    addElement(config) {
      const id = nanoid()
      
      // 基础尺寸配置
      const width = config.width || this.defaultWidth
      const length = config.length || this.defaultLength
      const rotation = config.rotation || this.defaultRotation
      const imageUrl = config.imageUrl || this.defaultImage

      // 样式配置
      const color = config.color || this.defaultColors.color
      const bgColor = config.bgColor || this.defaultColors.bgColor

      // 创建组
      const group = new Group([], {
        left: config.left,
        top: config.top,
        id,
        eleType: 'minuteHand',
        selectable: true,
        hasControls: true,
        hasBorders: true,
        originX: 'center',
        originY: 'center',
        width: width,
        height: length * 2,
        color: color,
        bgColor: bgColor,
        rotation: rotation,
        imageUrl: imageUrl
      })

      // 加载并创建图片
      loadSVGFromURL(imageUrl, (objects, options) => {
        console.log('SVG加载完成:', {
          objects,
          options,
          imageUrl
        })

        const svgGroup = util.groupSVGElements(objects, options)
        console.log('SVG Group创建完成:', {
          svgGroup,
          width: svgGroup.width,
          height: svgGroup.height,
          scaleX: svgGroup.scaleX,
          scaleY: svgGroup.scaleY
        })

        // 遍历每个对象，设置颜色
        svgGroup.getObjects().forEach(obj => {
          console.log('设置SVG子元素颜色:', {
            obj,
            type: obj.type,
            fill: obj.fill,
            newFill: color
          })
          obj.set('fill', color)
        })
        
        // 计算缩放比例，保持原始宽高比
        const originalWidth = svgGroup.width
        const originalHeight = svgGroup.height
        const targetHeight = length
        const targetWidth = (originalWidth / originalHeight) * targetHeight

        console.log('计算缩放比例:', {
          originalWidth,
          originalHeight,
          targetWidth,
          targetHeight,
          scale: targetHeight / originalHeight
        })

        // 设置图片大小和位置
        svgGroup.set({
          left: 0,
          top: -targetHeight,
          originX: 'center',
          originY: 'center',
          width: targetWidth,
          height: targetHeight,
          scaleX: targetWidth / originalWidth,
          scaleY: targetHeight / originalHeight
        })

        console.log('SVG Group设置完成:', {
          svgGroup,
          width: svgGroup.width,
          height: svgGroup.height,
          scaleX: svgGroup.scaleX,
          scaleY: svgGroup.scaleY,
          left: svgGroup.left,
          top: svgGroup.top
        })

        group.add(svgGroup)

        // 重新计算组的边界和坐标
        group._calcBounds()
        group._updateObjectsCoords()
        group.setCoords()

        console.log('Group设置完成:', {
          group,
          width: group.width,
          height: group.height,
          scaleX: group.scaleX,
          scaleY: group.scaleY,
          left: group.left,
          top: group.top
        })

        this.baseStore.canvas.requestRenderAll()
      })

      // 强制组重新计算边界
      group.setCoords()

      // 添加到画布
      this.baseStore.canvas.add(group)
      
      // 确保位置正确设置
      group.set({
        left: config.left,
        top: config.top
      })
      group.setCoords()

      // 添加到图层
      this.layerStore.addLayer(group)

      // 使用 requestRenderAll 替代 renderAll
      this.baseStore.canvas.requestRenderAll()

      // 设置为当前选中对象
      this.baseStore.canvas.discardActiveObject()
      this.baseStore.canvas.setActiveObject(group)
    },

    updateElement(element, config) {
      if (!this.baseStore.canvas) return
      const group = this.baseStore.canvas.getObjects().find((obj) => obj.id === element.id)
      if (!group || !group.getObjects) return

      // 保存当前位置和大小
      const currentLeft = group.left
      const currentTop = group.top
      const currentWidth = group.width
      const currentHeight = group.height
      const currentRotation = group.rotation
      const currentImageUrl = group.imageUrl

      // 更新组的属性
      const updateProps = {
        color: config.color,
        bgColor: config.bgColor,
        width: config.width,
        height: config.length * 2,
        rotation: config.rotation,
        imageUrl: config.imageUrl
      }

      // 过滤掉未定义的属性
      Object.keys(updateProps).forEach(key => {
        if (updateProps[key] !== undefined) {
          group.set(key, updateProps[key])
        }
      })

      // 如果图片URL发生变化，重新加载图片
      if (config.imageUrl && config.imageUrl !== currentImageUrl) {
        console.log('更新SVG图片:', {
          oldUrl: currentImageUrl,
          newUrl: config.imageUrl
        })

        group.remove(...group.getObjects())
        loadSVGFromURL(config.imageUrl, (objects, options) => {
          console.log('SVG加载完成:', {
            objects,
            options,
            imageUrl: config.imageUrl
          })

          const svgGroup = util.groupSVGElements(objects, options)
          console.log('SVG Group创建完成:', {
            svgGroup,
            width: svgGroup.width,
            height: svgGroup.height,
            scaleX: svgGroup.scaleX,
            scaleY: svgGroup.scaleY
          })

          // 遍历每个对象，设置颜色
          svgGroup.getObjects().forEach(obj => {
            console.log('设置SVG子元素颜色:', {
              obj,
              type: obj.type,
              fill: obj.fill,
              newFill: config.color || group.color
            })
            obj.set('fill', config.color || group.color)
          })
          
          // 计算缩放比例，保持原始宽高比
          const originalWidth = svgGroup.width
          const originalHeight = svgGroup.height
          const targetHeight = config.length || currentHeight / 2
          const targetWidth = (originalWidth / originalHeight) * targetHeight

          console.log('计算缩放比例:', {
            originalWidth,
            originalHeight,
            targetWidth,
            targetHeight,
            scale: targetHeight / originalHeight
          })

          // 设置图片大小和位置
          svgGroup.set({
            left: 0,
            top: -targetHeight,
            originX: 'center',
            originY: 'center',
            width: targetWidth,
            height: targetHeight,
            scaleX: targetWidth / originalWidth,
            scaleY: targetHeight / originalHeight
          })

          console.log('SVG Group设置完成:', {
            svgGroup,
            width: svgGroup.width,
            height: svgGroup.height,
            scaleX: svgGroup.scaleX,
            scaleY: svgGroup.scaleY,
            left: svgGroup.left,
            top: svgGroup.top
          })

          group.add(svgGroup)

          // 重新计算组的边界和坐标
          group._calcBounds()
          group._updateObjectsCoords()
          group.setCoords()

          console.log('Group设置完成:', {
            group,
            width: group.width,
            height: group.height,
            scaleX: group.scaleX,
            scaleY: group.scaleY,
            left: group.left,
            top: group.top
          })

          this.baseStore.canvas.requestRenderAll()
        })
      } else {
        // 只更新颜色
        const svgGroup = group.getObjects()[0]
        if (svgGroup) {
          console.log('更新SVG颜色:', {
            svgGroup,
            oldColor: svgGroup.fill,
            newColor: config.color || group.color
          })
          svgGroup.getObjects().forEach(obj => {
            console.log('设置SVG子元素颜色:', {
              obj,
              type: obj.type,
              fill: obj.fill,
              newFill: config.color || group.color
            })
            obj.set('fill', config.color || group.color)
          })
        }
      }

      // 恢复位置和大小
      group.set({
        left: currentLeft,
        top: currentTop,
        width: currentWidth,
        height: currentHeight,
        rotation: currentRotation
      })

      // 强制重新计算边界和渲染
      group.setCoords()
      this.baseStore.canvas.requestRenderAll()
    },

    encodeConfig(element) {
      if (!element) {
        throw new Error('无效的元素')
      }

      return {
        type: 'minuteHand',
        x: Math.round(element.left),
        y: Math.round(element.top),
        width: Math.round(element.width),
        length: Math.round(element.height / 2),
        color: element.color || this.defaultColors.color,
        bgColor: element.bgColor || this.defaultColors.bgColor,
        rotation: element.rotation || this.defaultRotation,
        imageUrl: element.imageUrl || this.defaultImage
      }
    },

    decodeConfig(config) {
      return {
        eleType: 'minuteHand',
        left: config.x,
        top: config.y,
        width: config.width,
        height: config.length * 2,
        color: config.color,
        bgColor: config.bgColor,
        rotation: config.rotation,
        imageUrl: config.imageUrl
      }
    }
  }
}) 
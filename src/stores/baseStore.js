import { defineStore } from 'pinia'
import { Circle, FabricImage } from 'fabric'
export const useBaseStore = defineStore('baseStore', {
  // state
  state: () => ({
    canvas: null,
    watchFaceName: '',
    kpayId: '',
    WATCH_SIZE: 454,
    themeColors: [],
    themeBackgroundColors: ['#000000'],
    themeBackgroundImages: [],
    currentThemeIndex: 0
  }),

  getters: {
    currentThemeColors() {
      return this.themeColors[this.currentThemeIndex] || []
    }
  },

  // actions
  actions: {
    setCanvas(fabricCanvas) {
      this.canvas = fabricCanvas
      // 禁用自动渲染，手动控制渲染时机
      this.canvas.renderOnAddRemove = false
      this.addBackground()
    },
    addBackground() {
      console.log('addBackground')
      // 创建表盘背景圆
      const watchFace = new Circle({
        eleType: 'global',
        left: 0,
        top: 0,
        radius: this.$state.WATCH_SIZE / 2,
        fill: this.$state.themeBackgroundColors[this.$state.currentThemeIndex] || '#000000',
        selectable: false,
        evented: true
      })

      // 设置背景图片
      const currentBgImage = this.$state.themeBackgroundImages[this.$state.currentThemeIndex]
      if (currentBgImage) {
        console.log('set background image', currentBgImage)
        FabricImage.fromURL(currentBgImage, (img) => {
          // 计算缩放比例以填充圆形区域
          const scale = this.$state.WATCH_SIZE / Math.min(img.width, img.height)
          img.set({
            eleType: 'background-image',
            scaleX: scale,
            scaleY: scale,
            left: 0,
            top: 0,
            selectable: false,
            evented: false
          })
          this.canvas.add(img)
          this.canvas.moveObjectTo(img, 0)
        })
      }

      this.canvas.set({
        clipPath: watchFace
      })
      this.canvas.add(watchFace)
      this.canvas.moveObjectTo(watchFace, 0)
    },

    loadGlobalElement() {
      // 全局元素加载
    },
    setWatchFaceName(name) {
      this.watchFaceName = name
    },
    setKpayId(id) {
      this.kpayId = id
    },
    // RGB 转 HEX
    rgbToHex(r, g, b) {
      const toHex = (n) => {
        const hex = n.toString(16)
        return hex.length === 1 ? '0' + hex : hex
      }
      return '#' + toHex(r) + toHex(g) + toHex(b)
    },

    // 添加颜色
    addColor(color, name) {
      if (!color || color === 'transparent') return

      // 如果是 rgba 格式，转换为 hex
      if (color.startsWith('rgba')) {
        const rgba = color.match(/\d+/g)
        if (rgba && rgba.length >= 3) {
          color = this.rgbToHex(parseInt(rgba[0]), parseInt(rgba[1]), parseInt(rgba[2]))
        }
      }

      // 如果是 rgb 格式，转换为 hex
      if (color.startsWith('rgb')) {
        const rgb = color.match(/\d+/g)
        if (rgb && rgb.length >= 3) {
          color = this.rgbToHex(parseInt(rgb[0]), parseInt(rgb[1]), parseInt(rgb[2]))
        }
      }

      // 如果已经存在相同颜色值对应的颜色 hex
      let existingColor = this.themeColors[this.currentThemeIndex].find((c) => c.hex === color)
      if (existingColor) {
        return
      }

      // 生成默认变量名
      if (!name) {
        const baseVarName = 'color'
        let index = this.themeColors[this.currentThemeIndex].length + 1
        name = `${baseVarName}${index}`
        while (this.themeColors[this.currentThemeIndex].find((c) => c.name === name)) {
          index++
          name = `${baseVarName}${index}`
        }
      }

      // 检查是否已存在相同名称的颜色
      const existingIndex = this.themeColors[this.currentThemeIndex].findIndex((c) => c.name === name)
      if (existingIndex !== -1) {
        // 更新现有颜色
        this.themeColors[this.currentThemeIndex][existingIndex].hex = color
      } else {
        // 添加新颜色
        this.themeColors[this.currentThemeIndex].push({
          name,
          hex: color
        })
      }

      return name
    },

    // 获取所有颜色
    getAllColors() {
      return this.themeColors[this.currentThemeIndex] || []
    },

    // 更新颜色变量名称
    updateColorName(oldName, newName) {
      if (!newName || oldName === newName) return false

      // 检查新名称是否已存在
      const exists = this.themeColors[this.currentThemeIndex].some((c) => c.name === newName)
      if (exists) return false

      // 查找并更新颜色变量名称
      const colorIndex = this.themeColors[this.currentThemeIndex].findIndex((c) => c.name === oldName)
      if (colorIndex !== -1) {
        this.themeColors[this.currentThemeIndex][colorIndex].name = newName
        return true
      }
      return false
    },

    // 获取颜色变量名称
    getColorVarName(hex) {
      return this.themeColors[this.currentThemeIndex].find((c) => c.hex === hex)?.name || ''
    },

    encodeConfig(element) {
      return {
        type: 'global',
        width: element.width,
        height: element.height,
        radius: element.radius
      }
    },
    getObjects() {
      return this.canvas ? this.canvas.getObjects() : []
    },
    getActiveObjects() {
      return this.canvas ? this.canvas.getActiveObjects() : []
    },
    // 切换主题
    toggleTheme() {
      // 更新颜色变量
      this.toggleThemeColors()
      // 更新背景颜色
      this.toggleThemeBackground()
      this.canvas.renderAll()
    },
    toggleThemeColors() {
      if (this.currentThemeIndex === -1) return
      const colors = this.themeColors[this.currentThemeIndex]
      console.log('toggleTheme', colors)
      if (!this.canvas) return

      // 更新颜色变量
      const colorMap = {}
      for (const color of colors) {
        colorMap[color.name] = color.hex
      }

      const fabricObjects = this.canvas.getObjects()

      for (const fabricObject of fabricObjects) {
        if (fabricObject.eleType === 'progressRing') {
          fabricObject
            .getObjects()
            .find((obj) => obj.id.endsWith('_main'))
            .set('stroke', colorMap[fabricObject.colorVarName])
          fabricObject
            .getObjects()
            .find((obj) => obj.id.endsWith('_bg'))
            .set('stroke', colorMap[fabricObject.bgColorVarName])
        } else {
          // 普通元素颜色
          if (fabricObject.colorVarName) {
            fabricObject.set('fill', colorMap[fabricObject.colorVarName])
          }
          // 普通元素背景颜色
          if (fabricObject.bgColorVarName) {
            fabricObject.set('fill', colorMap[fabricObject.bgColorVarName])
          }
        }
      }
    },
    toggleThemeBackground() {
      if (!this.canvas) {
        console.warn('画布不存在')
        return
      }

      const objects = this.canvas.getObjects()

      const watchFace = objects.find((obj) => obj.eleType === 'global')
      const oldBgImage = objects.find((obj) => obj.eleType === 'background-image')

      // 更新背景颜色
      if (watchFace) {
        watchFace.set('fill', this.themeBackgroundColors[this.currentThemeIndex] || '#000000')
      }

      // 先移除旧的背景图片
      if (oldBgImage) {
        this.canvas.remove(oldBgImage)
      }

      // 添加新的背景图片
      const currentBgImage = this.themeBackgroundImages[this.currentThemeIndex]
      if (currentBgImage) {
        // 创建一个新的 Image 对象
        const img = new Image()
        img.onload = () => {
          // 创建 Fabric.Image 实例
          const fabricImage = new FabricImage(img, {
            eleType: 'background-image',
            selectable: false,
            evented: false,
            originX: 'left',
            originY: 'top'
          })

          // 计算缩放比例以填充圆形区域
          const scale = this.WATCH_SIZE / Math.min(img.width, img.height)

          // 计算居中位置
          const left = (this.WATCH_SIZE - img.width * scale) / 2
          const top = (this.WATCH_SIZE - img.height * scale) / 2

          fabricImage.set({
            scaleX: scale,
            scaleY: scale,
            left: left,
            top: top
          })

          if (watchFace) {
            this.canvas.moveObjectTo(watchFace, 0) // 背景圆放在背景图片之上
          }

          // 添加图片并设置层级
          this.canvas.add(fabricImage)
          this.canvas.moveObjectTo(fabricImage, 1) // 背景图片放在最底层

          this.canvas.renderAll()
        }

        img.onerror = (error) => {
          console.error('加载图片出错', error)
        }

        // 设置图片源
        img.src = currentBgImage
        img.crossOrigin = 'anonymous'

      } else if (watchFace) {
        // 如果没有背景图片，确保背景圆在最底层
        this.canvas.moveObjectTo(watchFace, 0)
      }

      this.canvas.renderAll()
      console.log('背景更新完成')
    }
  }
})

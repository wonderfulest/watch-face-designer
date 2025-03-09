import { defineStore } from 'pinia'
import { Circle, FabricImage } from 'fabric'
import { getMetricBySymbol } from '@/config/settings'
export const useBaseStore = defineStore('baseStore', {
  // state
  state: () => ({
    canvas: null,
    id: null,
    watchFaceName: '',
    kpayId: '',
    WATCH_SIZE: 454,
    themeColors: [],
    themeBackgroundColors: ['#000000'],
    themeBackgroundImages: [],
    currentThemeIndex: 0,
    textCase: 0, // 文本大小写设置：0=默认, 1=全大写, 2=全小写, 3=驼峰
    labelLengthType: 0, // 标签长度类型：0=图标, 1=短文本, 2=中等文本, 3=长文本
    screenshot: null // 存储表盘截图数据
  }),

  getters: {
    currentThemeColors() {
      return this.themeColors[this.currentThemeIndex] || []
    }
  },

  // actions
  actions: {
    // 设置标签长度类型并更新所有标签元素
    setLabelLengthType(value) {
      console.log('设置标签长度类型:', value)
      
      // 如果没有画布，直接返回
      if (!this.canvas) {
        console.warn('没有画布，无法更新标签元素')
        return
      }
      
      // 获取所有对象
      const objects = this.canvas.getObjects()
      console.log('更新标签长度类型: 找到', objects.length, '个对象')
      
      // 遇到标签元素时需要重新加载
      let labelCount = 0
      
      // 延迟执行以确保状态已更新
      setTimeout(() => {
        objects.forEach(obj => {
          // 标签元素处理
          if (obj.eleType === 'label' && obj.metricSymbol) {
            labelCount++
            
            // 重新加载标签内容
            const metric = getMetricBySymbol(obj.metricSymbol)
            
            if (metric) {
              // 根据 labelLengthType 选择合适的标签长度
              let newText = 'Label'
              
              if (typeof metric.enLabel === 'object') {
                if (this.labelLengthType === 1) { // 短文本
                  newText = metric.enLabel.short || metric.enLabel.medium || metric.enLabel.long || 'Label'
                } else if (this.labelLengthType === 2) { // 中等文本
                  newText = metric.enLabel.medium || metric.enLabel.short || metric.enLabel.long || 'Label'
                } else if (this.labelLengthType === 3) { // 长文本
                  newText = metric.enLabel.long || metric.enLabel.medium || metric.enLabel.short || 'Label'
                } else { // 默认使用短文本
                  newText = metric.enLabel.short || metric.enLabel.medium || metric.enLabel.long || 'Label'
                }
              } else {
                // 兼容旧版本，如果 enLabel 不是对象而是字符串
                newText = metric.enLabel
              }
              
              // 保存新的原始文本
              obj.originalText = newText
              
              // 应用文本大小写设置
              if (this.textCase === 1) { // 全大写
                newText = newText.toUpperCase()
              } else if (this.textCase === 2) { // 全小写
                newText = newText.toLowerCase()
              } else if (this.textCase === 3) { // 驼峰式
                newText = newText.replace(/\b\w/g, c => c.toUpperCase())
              }
              
              // 更新文本
              obj.set('text', newText)
            }
          }
        })
        
        // 强制重新渲染画布
        this.canvas.renderAll()
        
        console.log('标签长度类型更新完成 - 标签元素:', labelCount)
      }, 10)
    },
    // 设置文本大小写并更新所有文本元素
    setTextCase(value) {
      console.log('设置文本大小写:', value)
      
      // 如果没有画布，直接返回
      if (!this.canvas) {
        console.warn('没有画布，无法更新文本元素')
        return
      }
      
      // 获取所有对象
      const objects = this.canvas.getObjects()
      console.log('更新文本大小写: 找到', objects.length, '个对象')
      
      // 遍历并更新所有元素
      let dateCount = 0
      let labelCount = 0
      let stepsCount = 0
      
      // 延迟执行以确保状态已更新
      setTimeout(() => {
        objects.forEach(obj => {
          // 日期元素处理
          if (obj.eleType === 'date') {
            dateCount++
            
            // 直接触发元素的更新函数
            if (typeof obj.updateTextCase === 'function') {
              try {
                obj.updateTextCase()
              } catch (error) {
                console.error('更新日期元素时出错:', error)
              }
            }
          } 
          // 标签元素处理
          else if (obj.eleType === 'label') {
            labelCount++
            
            // 如果有原始文本，则重新格式化
            if (obj.originalText) {
              let formattedText = obj.originalText
              
              // 应用文本大小写设置
              if (this.textCase === 1) { // 全大写
                formattedText = formattedText.toUpperCase()
              } else if (this.textCase === 2) { // 全小写
                formattedText = formattedText.toLowerCase()
              } else if (this.textCase === 3) { // 驼峰式
                formattedText = formattedText.replace(/\b\w/g, c => c.toUpperCase())
              }
              
              obj.set('text', formattedText)
            }
          }
          // 步数元素处理
          else if (obj.eleType === 'steps') {
            stepsCount++
            // 步数元素已经正常工作，不需要额外处理
          }
        })
        
        // 强制重新渲染画布
        this.canvas.renderAll()
        
        console.log('文本大小写更新完成 - 日期元素:', dateCount, '标签元素:', labelCount, '步数元素:', stepsCount)
      }, 10)
    },
    // 捕获并保存表盘截图
    captureScreenshot() {
      if (!this.canvas) {
        console.error('没有可用的画布')
        return this.getFallbackScreenshot()
      }
      
      try {
        // 确保画布内容是最新的
        this.canvas.renderAll()
        
        // 获取截图数据
        const dataURL = this.canvas.toDataURL({
          format: 'png',
          quality: 1
        })
        
        // 保存截图数据到 state
        this.screenshot = dataURL
        
        return dataURL
      } catch (error) {
        console.error('截图捕获失败:', error)
        // 如果截图失败，使用备用图片
        return this.getFallbackScreenshot()
      }
    },
    
    // 获取备用截图
    getFallbackScreenshot() {
      // 使用本地图片作为备用
      const localImagePath = '/screen-default.png';
      
      // 创建一个新的 Image 对象来加载本地图片
      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.src = localImagePath;
      // 返回一个 Promise，当图片加载完成后解析
      return new Promise((resolve) => {
        img.onload = () => {
          // 创建一个临时画布来获取图片数据
          const tempCanvas = document.createElement('canvas');
          tempCanvas.width = img.width;
          tempCanvas.height = img.height;
          const ctx = tempCanvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          
          // 获取数据 URL
          const dataURL = tempCanvas.toDataURL('image/png');
          
          // 保存截图数据到 state
          this.screenshot = dataURL;
          
          resolve(dataURL);
        };
        
        img.onerror = () => {
          console.error('加载备用图片失败');
          // 即使备用图片加载失败也返回 null
          this.screenshot = null;
          resolve(null);
        };
      });
    },
    
    // 获取当前截图
    getScreenshot() {
      return this.screenshot
    },
    
    // 清除截图
    clearScreenshot() {
      this.screenshot = null
    },
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

import { defineStore } from 'pinia';
import { Circle } from 'fabric'
export const useBaseStore = defineStore('baseStore', {
  // state
  state: () => ({
    canvas: null,
    watchFaceName: '',
    kpayId: '',
    WATCH_SIZE: 454,
    backgroundColor: '#000000',
    themeColors: [],
    themeBackgroundColors: [],
    themeBackgroundImages: [],
    currentThemeIndex: 0,
  }),

  getters: {
    currentThemeColors() {
      return this.themeColors[this.currentThemeIndex] || [];
    },
  },

  // actions
  actions: {
    setCanvas(fabricCanvas) {
      this.canvas = fabricCanvas;
      // 禁用自动渲染，手动控制渲染时机
      this.canvas.renderOnAddRemove = false;
      this.addBackground();
    },
    addBackground (){
      console.log('addBackground')
       // 创建表盘背景圆
       const watchFace = new Circle({
          eleType: 'global',
          left: 0,
          top: 0,
          radius: this.$state.WATCH_SIZE / 2,
          fill: this.$state.backgroundColor,
          selectable: false,
          evented: true
      });
      this.canvas.set({
          clipPath: watchFace
      });
      this.canvas.add(watchFace);
      this.canvas.moveObjectTo(watchFace, 0); 
    },
    updateBackgroundFill() {
      const objects = this.canvas.getObjects();
      const watchFace = objects.find(obj => obj.eleType === 'global');
      if (watchFace) {
        watchFace.set('fill', this.backgroundColor);
        this.canvas.renderAll();
      } else {
        console.log('未找到表盘对象，当前对象列表:', objects);
      }
    },
    loadGlobalElement() {
      // 全局元素加载
    },
    setWatchFaceName(name) {
      this.watchFaceName = name;
    },
    setKpayId(id) {
      this.kpayId = id;
    },
    // RGB 转 HEX
    rgbToHex(r, g, b) {
      const toHex = (n) => {
        const hex = n.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      };
      return '#' + toHex(r) + toHex(g) + toHex(b);
    },

    // 添加颜色
    addColor(color, name) {
      if (!color || color === 'transparent') return;
      
      // 如果是 rgba 格式，转换为 hex
      if (color.startsWith('rgba')) {
        const rgba = color.match(/\d+/g);
        if (rgba && rgba.length >= 3) {
          color = this.rgbToHex(parseInt(rgba[0]), parseInt(rgba[1]), parseInt(rgba[2]));
        }
      }
      
      // 如果是 rgb 格式，转换为 hex
      if (color.startsWith('rgb')) {
        const rgb = color.match(/\d+/g);
        if (rgb && rgb.length >= 3) {
          color = this.rgbToHex(parseInt(rgb[0]), parseInt(rgb[1]), parseInt(rgb[2]));
        }
      }

      // 生成默认变量名
      if (!name) {
        const baseVarName = 'color';
        let index = this.themeColors[this.currentThemeIndex].length + 1;
        name = `${baseVarName}${index}`;
        while (this.themeColors[this.currentThemeIndex].find(c => c.name === name)) {
          index++;
          name = `${baseVarName}${index}`;
        }
      }

      // 检查是否已存在相同名称的颜色
      const existingIndex = this.themeColors[this.currentThemeIndex].findIndex(c => c.name === name);
      if (existingIndex !== -1) {
        // 更新现有颜色
        this.themeColors[this.currentThemeIndex][existingIndex].hex = color;
      } else {
        // 添加新颜色
        this.themeColors[this.currentThemeIndex].push({
          name,
          hex: color
        });
      }

      return name;
    },

    // 获取所有颜色
    getAllColors() {
      return this.themeColors[this.currentThemeIndex] || [];
    },

    // 更新颜色变量名称
    updateColorName(oldName, newName) {
      if (!newName || oldName === newName) return false;
      
      // 检查新名称是否已存在
      const exists = this.themeColors[this.currentThemeIndex].some(c => c.name === newName);
      if (exists) return false;

      // 查找并更新颜色变量名称
      const colorIndex = this.themeColors[this.currentThemeIndex].findIndex(c => c.name === oldName);
      if (colorIndex !== -1) {
        this.themeColors[this.currentThemeIndex][colorIndex].name = newName;
        return true;
      }
      return false;
    },

    // 获取颜色变量名称
    getColorVarName(hex) {
      return this.themeColors[this.currentThemeIndex].find(c => c.hex === hex)?.name || '';
    },

    encodeConfig(element) {
      return {
        type: 'global',
        backgroundColor: this.$state.backgroundColor,
        width: element.width,
        height: element.height,
        radius: element.radius
      };
    },
    getObjects() {
      return this.canvas ? this.canvas.getObjects() : [];
    },
    getActiveObjects() {
      return this.canvas ? this.canvas.getActiveObjects() : [];
    },
    // 切换主题
    toggleTheme(colors) {
      console.log('toggleTheme', colors)
      if (!this.canvas) return

      const colorMap = {}
      for (const color of colors) {
        colorMap[color.name] = color.hex
      }
      
      const fabricObjects = this.canvas.getObjects();

      for (const fabricObject of fabricObjects) {
        if (fabricObject.eleType === 'progressRing') {
          fabricObject.getObjects().find((obj) => obj.id.endsWith("_main")).set('stroke', colorMap[fabricObject.colorVarName])
          fabricObject.getObjects().find((obj) => obj.id.endsWith("_bg")).set('stroke', colorMap[fabricObject.bgColorVarName])
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

      this.canvas.renderAll()
    },

  }
}); 
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
  }),

  // actions
  actions: {
    setCanvas(fabricCanvas) {
      this.canvas = fabricCanvas;
      // 禁用自动渲染，手动控制渲染时机
      this.canvas.renderOnAddRemove = false;
      this.addBackground();
    },
  
    addBackground (){
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
    loadGlobalElement() {
      this.$state.canvas.clear();
      this.addBackground();
    },
    setWatchFaceName(name) {
      this.watchFaceName = name;
    },

    setKpayId(id) {
      this.kpayId = id;
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
import { defineStore } from 'pinia';
import { Circle } from 'fabric'
export const useBaseStore = defineStore('baseStore', {
  // state
  state: () => ({
    canvas: null,
    watchFaceName: '',
    kpayId: '',
    WATCH_SIZE: 454,
    backgroundColor: '#000000'
  }),

  // actions
  actions: {
    setCanvas(fabricCanvas) {
      this.canvas = fabricCanvas;
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
  }
}); 
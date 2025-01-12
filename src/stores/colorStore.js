import { defineStore } from 'pinia';
import { useBaseStore } from './base';

export const useColorStore = defineStore('color', {
  state: () => ({
    colors: {}
  }),

  actions: {
    // 重置颜色统计
    resetColors() {
      this.colors = {};
    },

    // 添加颜色到统计
    addColor(color) {
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

      if (!this.colors[color]) {
        this.colors[color] = 0;
      }
      this.colors[color] += 1;
    },

    // 从画布收集所有颜色
    collectColors() {
      const baseStore = useBaseStore();
      if (!baseStore.canvas) return;

      this.resetColors();

      baseStore.canvas.getObjects().forEach(obj => {
        // 收集填充颜色
        if (obj.fill && typeof obj.fill === 'string') {
          this.addColor(obj.fill);
        }
        // 收集背景颜色
        if (obj.backgroundColor && typeof obj.backgroundColor === 'string') {
          this.addColor(obj.backgroundColor);
        }
        // 收集边框颜色
        if (obj.stroke && typeof obj.stroke === 'string') {
          this.addColor(obj.stroke);
        }
        // 如果是组合对象，遍历其子对象
        if (obj.type === 'group' && obj._objects) {
          obj._objects.forEach(child => {
            if (child.fill && typeof child.fill === 'string') {
              this.addColor(child.fill);
            }
            if (child.backgroundColor && typeof child.backgroundColor === 'string') {
              this.addColor(child.backgroundColor);
            }
            if (child.stroke && typeof child.stroke === 'string') {
              this.addColor(child.stroke);
            }
          });
        }
      });
    },

    // 获取所有使用的颜色
    getAllColors() {
      this.collectColors();
      return Object.entries(this.colors)
        .sort(([, countA], [, countB]) => countB - countA)
        .map(([color]) => color);
    },

    // RGB 转 HEX
    rgbToHex(r, g, b) {
      const toHex = (n) => {
        const hex = n.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      };
      return '#' + toHex(r) + toHex(g) + toHex(b);
    }
  }
});

import { defineStore } from 'pinia';
import { useBaseStore } from './base';

export const useColorStore = defineStore('color', {
  state: () => ({
    colors: []
  }),

  actions: {
    // 加载主题颜色
    loadThemeColors(colors) {
      this.colors = colors;
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
        let index = this.colors.length + 1;
        name = `${baseVarName}${index}`;
        while (this.colors.find(c => c.name === name)) {
          index++;
          name = `${baseVarName}${index}`;
        }
      }

      // 检查是否已存在相同名称的颜色
      const existingIndex = this.colors.findIndex(c => c.name === name);
      if (existingIndex !== -1) {
        // 更新现有颜色
        this.colors[existingIndex].hex = color;
      } else {
        // 添加新颜色
        this.colors.push({
          name,
          hex: color
        });
      }

      return name;
    },

    // 获取所有颜色
    getAllColors() {
      return this.colors;
    },

    // 更新颜色变量名称
    updateColorName(oldName, newName) {
      if (!newName || oldName === newName) return false;
      
      // 检查新名称是否已存在
      const exists = this.colors.some(c => c.name === newName);
      if (exists) return false;

      // 查找并更新颜色变量名称
      const colorIndex = this.colors.findIndex(c => c.name === oldName);
      if (colorIndex !== -1) {
        this.colors[colorIndex].name = newName;
        return true;
      }
      return false;
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

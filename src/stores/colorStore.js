import { defineStore } from 'pinia';
import { useBaseStore } from './base';

export const useColorStore = defineStore('color', {
  state: () => ({
    themeColors: [],
    currentThemeIndex: 0
  }),

  actions: {
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
      console.log('更新颜色变量名称',oldName, newName);
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

    // RGB 转 HEX
    rgbToHex(r, g, b) {
      const toHex = (n) => {
        const hex = n.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      };
      return '#' + toHex(r) + toHex(g) + toHex(b);
    },

    // 获取颜色变量名称
    getColorVarName(hex) {
      return this.themeColors[this.currentThemeIndex].find(c => c.hex === hex)?.name || '';
    },

  }
});

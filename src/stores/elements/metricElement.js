import { defineStore } from 'pinia';
import { useBaseStore } from '../baseStore';
import { useLayerStore } from '../layerStore';
import { nanoid } from 'nanoid';
import { DataTypeOptions } from '@/config/settings'

export const useMetricStore = defineStore('dataElement', {
    state: () => {
        const baseStore = useBaseStore();
        const layerStore = useLayerStore();
        
        return {
            dataElements: [],
            baseStore,
            layerStore,
        }
    },

    actions: {
        async addMetricElement(type, options = {}) {
            if (!this.baseStore.canvas) {
                throw new Error('画布未初始化，无法添加数据元素');
            }

            try {
                // 为整个数据元素组生成一个 nanoId
                const elementId = nanoid();
       
                const metric = this.DataTypeOptions.filter(item => item.metricSymbol === type)[0];

                if (!metric) {
                    console.error('未找到元素')
                }
                // 创建图标
                const icon = new fabric.Text(metric.icon, {
                    fontFamily: 'super-regular', // 使用新的字体
                    fontSize: Number(options.size),  // 修改默认字体大小为 36
                    fill: '#FFFFFF',
                    selectable: true,
                    hasControls: true,
                    hasBorders: true,
                    originX: 'center',
                    originY: 'center',
                });

                // 创建文本
                const textObject = new fabric.Text(metric.text, {
                    fontSize: Number(options.size) || 36,  // 修改默认字体大小为 36
                    fill: '#FFFFFF',
                    fontFamily: options.fontFamily || 'Arial',
                    selectable: true,
                    hasControls: true,
                    hasBorders: true,
                    originX: 'center',
                    originY: 'center'
                });

                // 计算图标和文字的宽度
                const iconWidth = icon.width;
                const textWidth = textObject.width;

                // 设置图标和文字的位置，确保不重合
                icon.set({ left: -textWidth / 2 - 5 }); // 图标在左侧，间隔5个像素
                textObject.set({ left: iconWidth / 2 + 5 }); // 文字在右侧，间隔5个像素

                // 获取默认位置（表盘中心）
                const canvasCenter = {
                    left: this.baseStore.canvas.width / 2,
                    top: this.baseStore.canvas.height / 2
                };

                // 创建元素组
                const group = new fabric.Group([icon, textObject], {
                    left: canvasCenter.left,
                    top: canvasCenter.top,
                    originX: 'center',
                    originY: 'center',
                    selectable: true
                });

                // 添加到画布
                this.baseStore.canvas.add(group);

                // 更新 defaultPos 变量，用于后续的移动计算
                const defaultPos = {
                    left: canvasCenter.left,
                    top: canvasCenter.top
                };

                // 将 id 添加到 fabric 对象中以便后续引用
                group.elementId = elementId;

                // 添加事件监听 - 使用 moved 事件替代 moving
                group.on('moved', (e) => {
                    const dx = e.target.left - defaultPos.left;
                    const dy = e.target.top - defaultPos.top;
                    group.set({
                        left: defaultPos.left + dx,
                        top: defaultPos.top + dy
                    });
                    this.baseStore.canvas.renderAll();
                });
                // 创建元素组
                const element = {
                    id: elementId,  // 使用生成的 nanoId
                    type: 'metric',
                    label: metric.label, // 数据项数据类型
                    metricSymbol: type,
                    layoutType: ':LAYOUT_TYPES_CENTER',
                    group: group
                };
                
                this.baseStore.addElement(element);
                this.dataElements.push(element);
                this.baseStore.canvas.renderAll();

                // 添加到图层 store
                this.layerStore.addLayer(element);

                return element;
            } catch (error) {
                console.error('创建数据元素失败:', error);
                throw error;
            }
        },

        encodeConfig(element) {
            if (!element || !element.group) {
                throw new Error('无效的元素');
            }

            const group = element.group;
            return {
                type: 'metric',
                metricSymbol: element.metricSymbol,
                x: (group.left / this.baseStore.canvas.radius).toFixed(3),
                y: (group.top / this.baseStore.canvas.radius).toFixed(3),
                originX: group.originX,
                originY: group.originY,
                layoutType: element.layoutType,
                iconFont: group.getObjects()[0].fontFamily || "", // 假设文本对象在组的第二个位置
                iconSize: group.getObjects()[0].fontSize || '-1',
                iconColor: group.getObjects()[0].fill || "",
                textFont: group.getObjects()[1].fontFamily || "", // 假设文本对象在组的第二个位置
                textSize: group.getObjects()[1].fontSize || '-1',
                textColor: group.getObjects()[1].fill || ""
            };
        }
    }
}); 
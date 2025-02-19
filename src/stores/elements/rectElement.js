import { defineStore } from 'pinia';
import { useBaseStore } from '../baseStore';
import { useLayerStore } from '../layerStore';
import { useBaseElementStore } from './baseElement';
import { nanoid } from 'nanoid';
import { Rect } from 'fabric';

export const useRectStore = defineStore('rectElement', {
    state: () => {
        const baseStore = useBaseStore();
        const layerStore = useLayerStore();
        const baseElement = useBaseElementStore();
        
        return {
            baseStore,
            layerStore,
            baseElement,
        }
    },

    actions: {
        async addElement(options = {}) {
            if (!this.baseStore.canvas) {
                throw new Error('画布未初始化，无法添加文本元素');
            }

            try {
                const rectOptions = {
                    id: nanoid(),
                    eleType: 'rect',
                    left: options.left,
                    top: options.top,
                    originX: options.originX,
                    originY: options.originY,
                    width: options.width,
                    height: options.height,
                    fill: options.fill,
                    rx: options.borderRadius,
                    ry: options.borderRadius,
                    stroke: options.stroke,
                    strokeWidth: options.strokeWidth,
                    selectable: true,
                    hasControls: true, // 启用控件
                    lockScalingFlip: true // 防止对象翻转
                };
                
                const rect = new Rect(rectOptions);
               
                // 添加到画布
                this.baseStore.canvas.add(rect);

                // 添加到图层
                this.layerStore.addLayer(rect);

                // 渲染画布
                this.baseStore.canvas.renderAll();

                // 设置为当前选中对象
                this.baseStore.canvas.setActiveObject(rect);

                return rect;
            } catch (error) {
                console.error('创建文本元素失败:', error);
                throw error;
            }
        },
        encodeConfig(element) {
            if (!element) {
                throw new Error('无效的元素');
            }
            return {
                type: 'rect',
                x: Math.round(element.left),
                y: Math.round(element.top),
                width: element.width,
                height: element.height,
                originX: element.originX,
                originY: element.originY,
                borderRadius: element.rx,
                color: element.fill,
                stroke: element.stroke,
                strokeWidth: element.strokeWidth
            };
        },
        decodeConfig(config) {
            const decodedConfig = {
                left: config.x,
                top: config.y,
                width: config.width,
                height: config.height,
                fill: config.color,
                borderRadius: config.borderRadius,
                stroke: config.stroke,
                strokeWidth: config.strokeWidth,
                originX: config.originX,
                originY: config.originY,
            };
            
            return decodedConfig;
        }
    }
}); 
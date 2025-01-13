import { defineStore } from 'pinia';
import { useBaseStore } from '../base';
import { useLayerStore } from '../layerStore';
import { nanoid } from 'nanoid';
import moment from 'moment';
import { ref } from 'vue';
import { FabricText } from 'fabric';

export const useTimeStore = defineStore('timeStore', {
    state: () => {
        const baseStore = useBaseStore();
        const layerStore = useLayerStore();
        return {
            timeElements: [],
            updateInterval: null,
            baseStore,
            layerStore,
        }
    },

    actions: {
        formatTime(date, format) {
            return moment(date).format(format);
        },
        async addElement(options = {}) {
            if (!this.baseStore.canvas) {
                throw new Error('画布未初始化，无法添加时间元素');
            }

            try {
                let text = this.formatTime(new Date(), options.formatter);
                const timeOptions =  {
                    eleType: 'time',
                    id: nanoid(),
                    left: options.left,
                    top: options.top,
                    originX: options.originX,
                    originY: options.originY,
                    fontSize: Number(options.size),
                    fill: options.fill,
                    fontFamily: options.fontFamily,
                    formatter: options.formatter,
                    selectable: true,
                    hasControls: true,
                    hasBorders: true,
                }

                const element = new FabricText(text, timeOptions);

                this.baseStore.canvas.add(element);

                this.layerStore.addLayer(element);

                this.baseStore.canvas.setActiveObject(element);
                this.baseStore.canvas.renderAll();

                return element;
            } catch (error) {
                console.error('创建时间元素失败:', error);
                throw error;
            }
        },
        encodeConfig(element) {
            if (!element) {
                throw new Error('无效的元素');
            }
            return {
                type: 'time',
                x: Math.round(element.left),
                y: Math.round(element.top),
                originX: element.originX,
                originY: element.originY,
                font: element.fontFamily,
                size: element.fontSize,
                color: element.fill,
                formatter: element.formatter
            };
        },
        decodeConfig(config) {
            const decodedConfig = {
                left: config.x,
                top: config.y,
                fill: config.color,
                fontFamily: config.font,
                size: config.size,
                formatter: config.formatter,
                originX: config.originX,
                originY: config.originY
            };
            
            return decodedConfig;
        },
        updateTimeDisplay() {
            const now = new Date();
            this.timeElements.forEach(element => {
                if (!element.element) return;
                const formattedTime = this.formatTime(now, element.element.formatter);
                element.element.set('text', formattedTime);
            });

            if (this.baseStore.canvas) {
                this.baseStore.canvas.renderAll();
            }
        },
        startTimeUpdate() {
            this.updateInterval = setInterval(() => this.updateTimeDisplay(), 1000);
        },
        stopTimeUpdate() {
            if (this.updateInterval) {
                clearInterval(this.updateInterval);
                this.updateInterval = null;
            }
        },
    }
}); 
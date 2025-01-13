<template>
    <canvas ref="canvasRef"></canvas>
</template>

<script setup>
import { onMounted, ref, onUnmounted, computed } from 'vue';
import { Canvas, FabricText, Circle, FabricObject } from 'fabric'
import emitter from '@/utils/eventBus';
import { useBaseStore } from '@/stores/base';
import { useTimeStore } from '@/stores/elements/timeElement';
import { useLayerStore } from '@/stores/layerStore';
import { initAligningGuidelines } from '@/lib/aligning_guidelines';
import { initCenteringGuidelines } from '@/lib/centering_guidelines';
const canvasRef = ref(null);
const baseStore = useBaseStore();
const timeElement = useTimeStore();
const layerStore = useLayerStore();
let updateInterval;
const WATCH_SIZE = computed(() => baseStore.WATCH_SIZE);

FabricObject.customProperties = ['id', 'eleType', 'metricSymbol', 'metricGroup'];

onMounted(() => {

    // 创建画布，尺寸比手表大一些以显示边界
    const canvas = new Canvas(canvasRef.value, {
        width: WATCH_SIZE.value,
        height: WATCH_SIZE.value,
        radius: WATCH_SIZE.value / 2,
        backgroundColor: '#f5f5f5',
    });
    // 对象间对齐辅助线
    initAligningGuidelines(canvas);
    initCenteringGuidelines(canvas);
    // 可以多选
    canvas.selection = true;

    canvas.on('object:moving', (e) => {
        refreshCanvas(e)
    });

    canvas.on('object:modified', (e) => {
        refreshCanvas(e)
    });

    canvas.on('object:moved', (event) => {
        refreshCanvas(event)
    });

    canvas.on('selection:created', (event) => {
        refreshCanvas(event)
    });

    canvas.on('selection:updated', (event) => {
        refreshCanvas(event)
    });

    canvas.on('selection:cleared', (event) => {
        refreshCanvas(event)
    });

    canvas.on('deselected', (event) => {
        refreshCanvas(event)
    });

    canvas.on('mouse:up', (e) => {
        refreshCanvas(e)
    });

    canvas.on('mouse:down', function(event) {
        refreshCanvas(event)
    });

    baseStore.setCanvas(canvas);

    updateInterval = setInterval(() => timeElement.updateTimeDisplay(), 1000);
});

const refreshCanvas = (event) => {
    emitter.emit('refresh-canvas', { event });
};

onUnmounted(() => {
    if (updateInterval) {
        clearInterval(updateInterval);
    }
});
</script>

<style scoped>
.canvas-wrapper {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.zoom-controls {
    position: absolute;
    top: 20px;
    right: 20px;
    background: white;
    padding: 8px;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    display: flex;
    gap: 8px;
    align-items: center;
}

.zoom-controls button {
    width: 24px;
    height: 24px;
    border: 1px solid #ddd;
    border-radius: 4px;
    background: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
}

.zoom-controls button:hover {
    background: #f5f5f5;
}

.canvas-container {
    width: 600px;
    height: 600px;
    background: white;
    border-radius: 4px;
}
</style>

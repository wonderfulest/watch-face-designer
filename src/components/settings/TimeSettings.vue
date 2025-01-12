<template>
    <div class="settings-section">
        <div class="setting-item">
            <label>字体大小</label>
            <select v-model.number="fontSize" @change="updateFontSize">
                <option v-for="size in fontSizes" :key="size" :value="size">
                    {{ size }}px
                </option>
            </select>
        </div>
        <div class="setting-item">
            <label>字体颜色</label>
            <color-picker 
                v-model="textColor"
                @change="updateTextColor"
            />
        </div>
        <div class="setting-item">
            <label>字体</label>
            <font-picker 
                v-model="fontFamily"
                @change="updateFontFamily"
            />
        </div>
        <div class="setting-item">
            <label>位置</label>
            <div class="position-inputs">
                <div>
                    <span>X:</span>
                    <input 
                        type="number" 
                        v-model.number="positionX"
                        @change="updatePosition"
                    >
                </div>
                <div>
                    <span>Y:</span>
                    <input 
                        type="number" 
                        v-model.number="positionY"
                        @change="updatePosition"
                    >
                </div>
            </div>
        </div>
        <div class="setting-item">
            <label>对齐方式</label>
            <div class="align-buttons">
                <button 
                    v-for="align in originXOptions" 
                    :key="align.value"
                    @click="updateOriginX(align.value)"
                    :class="{ active: originX === align.value }"
                    :title="align.label"
                >
                    <i :class="align.icon"></i>
                </button>
            </div>
        </div>
        <div class="setting-item">
            <label>时间格式</label>
            <select v-model="formatter" @change="updateTimeFormat">
                <option 
                    v-for="option in TimeFormatOptions" 
                    :key="option.value" 
                    :value="option.value"
                >
                    {{ option.label }}
                </option>
            </select>
        </div>
    </div>
</template>

<script setup>
import moment from 'moment';
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { useBaseStore } from '@/stores/base';
import { useTimeStore } from '@/stores/elements/timeElement';
import { useFontStore } from '@/stores/fontStore';
import { fontSizes, originXOptions, TimeFormatOptions } from '@/config/settings';
import ColorPicker from '@/components/color-picker/index.vue';
import FontPicker from '@/components/font-picker/index.vue'; // Import FontPicker component

const timeElement = useTimeStore();
const fontStore = useFontStore();
const baseStore = useBaseStore();

const props = defineProps({
    element: {
        type: Object,
        required: true
    }
});

// 设置项的响应式状态
const fontSize = ref(props.element?.fontSize);
const textColor = ref(props.element?.fill);
const fontFamily = ref(props.element?.fontFamily);
const positionX = ref(Math.round(props.element?.left));
const positionY = ref(Math.round(props.element?.top));
const originX = ref(props.element?.originX);
const formatter = ref(props.element?.formatter);

// 加载字体列表
onMounted(async () => {
    if (fontStore.fonts.length === 0) {
        await fontStore.fetchFonts();
    }
    // 如果有字体，预加载当前字体
    if (fontFamily.value) {
        await fontStore.loadFont(fontFamily.value);
    }
});

// 监听元素属性变化
watch(() => props.element, (obj) => {
    if (!obj) return;
}, { deep: true });

// 更新方法
const updateFontSize = () => {
    if (!props.element || !baseStore.canvas) return;
    props.element.set('fontSize', fontSize.value);
    baseStore.canvas.renderAll();
};

const updateTextColor = () => {
    if (!props.element || !baseStore.canvas) return;
    props.element.set('fill', textColor.value);
    baseStore.canvas.renderAll();
};

const updateFontFamily = async (font) => {
    if (!props.element || !baseStore.canvas) return;
    
    props.element.set('fontFamily', font);
    props.element.setCoords();
    baseStore.canvas.renderAll();
};

const updatePosition = () => {
    if (!props.element || !baseStore.canvas) return;
    props.element.set({
        left: positionX.value,
        top: positionY.value
    });
    baseStore.canvas.renderAll();
};

// 监听画布上的对象位置变化
watch(() => props.element?.left, (newLeft) => {
    if (newLeft !== undefined) {
        positionX.value = Math.round(newLeft);
    }
});

watch(() => props.element?.top, (newTop) => {
    if (newTop !== undefined) {
        positionY.value = Math.round(newTop);
    }
});

// 监听画布上的对象属性变化
watch(() => props.element?.fontSize, (newSize) => {
    if (newSize !== undefined && newSize !== fontSize.value) {
        fontSize.value = newSize;
    }
});

watch(() => props.element?.fill, (newColor) => {
    if (newColor !== undefined && newColor !== textColor.value) {
        textColor.value = newColor;
    }
});

watch(() => props.element?.fontFamily, (newFont) => {
    if (newFont !== undefined && newFont !== fontFamily.value) {
        fontFamily.value = newFont;
    }
});

watch(() => props.element?.formatter, (newFormatter) => {
    if (newFormatter !== undefined && newFormatter !== formatter.value) {
        formatter.value = newFormatter;
    }
});

// 更新方法
const updateOriginX = (value) => {
    if (!props.element || !baseStore.canvas) return;
    const obj = props.element;
    obj.set({
        originX: value
    });
    originX.value = value;
    props.element.setCoords();
    baseStore.canvas.renderAll();
};

const updateTimeFormat = () => {
    if (!props.element || !baseStore.canvas) return;
    props.element.set('formatter', formatter.value);
    props.element.set('text', moment(new Date()).format(formatter.value));
    baseStore.canvas.renderAll();
};

</script>

<style scoped>
@import '../../assets/styles/settings.css';

.color-input {
    position: relative;
    width: 100%;
}

.color-input input {
    width: 100%;
    height: 32px;
    padding: 4px 8px;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    cursor: pointer;
    text-align: center;
    color: transparent;
}

.color-input input:hover {
    border-color: #409eff;
}

.color-input .color-picker {
    position: absolute;
    top: 100%;
    left: 0;
    margin-top: 4px;
    z-index: 1000;
}
</style>
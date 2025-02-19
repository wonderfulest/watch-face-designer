<template>
    <div class="settings-section">
        <!-- 位置设置 -->
        <h4 class="section-title">位置设置</h4>
        <div class="setting-item">
            <label>位置</label>
            <div class="position-inputs">
                <span>X:</span>
                <input 
                    type="number" 
                    v-model.number="positionX"
                    @change="updatePosition"
                >
                <span>Y:</span>
                <input 
                    type="number" 
                    v-model.number="positionY"
                    @change="updatePosition"
                >
            </div>
        </div>
        <!-- 布局方式 -->
        <div class="setting-item">
            <label>布局方式</label>
            <div class="align-buttons">
                <button 
                    v-for="align in LayoutOptions" 
                    :key="align.value"
                    @click="updateLayout(align.value)"
                    :class="{ active: originY === align.value }"
                    :title="align.label"
                >
                    <i :class="align.icon"></i>
                </button>
            </div>
        </div>
        
        <!-- 图标设置 -->
        <h4 class="section-title">图标设置</h4>
        <div class="setting-item">
            <label>图标大小</label>
            <select v-model.number="iconSize" @change="updateIconSize">
                <option v-for="size in fontSizes" :key="size" :value="size">
                    {{ size }}px
                </option>
            </select>
        </div>
        <div class="setting-item">
            <label>图标颜色</label>
            <ColorPicker 
                v-model="iconColor"
                @change="updateIconColor"
            />
        </div>

        <!-- 文本设置 -->
        <h4 class="section-title">文本设置</h4>
        <div class="setting-item">
            <label>文本大小</label>
            <select v-model.number="textSize" @change="updateTextSize">
                <option v-for="size in fontSizes" :key="size" :value="size">
                    {{ size }}px
                </option>
            </select>
        </div>
        <div class="setting-item">
            <label>文本颜色</label>
            <ColorPicker 
                v-model="textColor"
                @change="updateTextColor"
            />
        </div>
        <div class="setting-item">
            <label>文本字体</label>
            <select v-model="textFontFamily" @change="updateTextFontFamily">
                <option 
                    v-for="font in fontStore.fontOptions" 
                    :key="font.value" 
                    :value="font.value"
                >
                    {{ font.label }}
                </option>
            </select>
        </div>
    </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { useBaseStore } from '@/stores/baseStore';
import { useFontStore } from '@/stores/fontStore';
import { fontSizes, LayoutOptions } from '@/config/settings';
import ColorPicker from '@/components/color-picker/index.vue';

const props = defineProps({
    element: {
        type: Object,
        required: true
    }
});

const baseStore = useBaseStore();
const fontStore = useFontStore();

// Helper function to get element by type
const getElementByType = (type) => {
    return props.element?._objects?.find(obj => obj.eleType === type);
};

// 设置项的响应式状态
const groupElement = props.element;
const iconElement = getElementByType('metric-icon');
const textElement = getElementByType('metric-text');

const positionX = ref(Math.round(props.element.group?.left || 0));
const positionY = ref(Math.round(props.element.group?.top || 0));
const iconSize = ref(iconElement?.fontSize || 36);
const iconColor = ref(iconElement?.fill || '#FFFFFF');
const textSize = ref(textElement?.fontSize || 36);
const textColor = ref(textElement?.fill || '#FFFFFF');
const textFontFamily = ref(textElement?.fontFamily || 'Arial');
const layoutType = ref(props.element.group.layoutType || ':LAYOUT_TYPES_CENTER');

// 加载字体列表
onMounted(async () => {
    if (fontStore.fonts.length === 0) {
        await fontStore.fetchFonts();
    }
    // 如果有字体，预加载当前字体
    if (textFontFamily.value) {
        await fontStore.loadFont(textFontFamily.value);
    }
});

// 监听元素属性变化
watch(() => props.element, (element) => {
    if (!element) {
        return;
    }
}, { deep: true, immediate: true });

const refreshGroupWhenSizeChanged =() => {
    // 计算图标和文字的宽度
    const iconWidth = props.element.group._objects[0].width;
    const textWidth = props.element.group._objects[1].width;
    // 设置图标和文字的位置，确保不重合
    props.element.group._objects[0].set({ left: -textWidth / 2 - 5 }); // 图标在左侧，间隔5个像素
    props.element.group._objects[1].set({ left: iconWidth / 2 + 5 }); // 文字在右侧，间隔5个像素

    props.element.group._calcBounds();
    props.element.group.setCoords();
    updatePosition();
    baseStore.canvas.renderAll();
}

// 图标更新方法
const updateIconSize = () => {
    if (!props.element.group || !baseStore.canvas) return;
    props.element.group.dirty = true;
    props.element.group._objects[0].set('fontSize', iconSize.value);
    refreshGroupWhenSizeChanged();
};

const updateIconColor = () => {
    if (!props.element.group || !baseStore.canvas) return;
    props.element.group.dirty = true;
    props.element.group._objects[0].set('fill', iconColor.value);
    baseStore.canvas.renderAll();
};

// 文本更新方法
const updateTextSize = () => {
    if (!props.element.group || !baseStore.canvas) return;
    props.element.group.dirty = true;
    props.element.group._objects[1].set('fontSize', textSize.value);
    refreshGroupWhenSizeChanged();
};

const updateTextColor = () => {
    if (!props.element.group || !baseStore.canvas) return;
    props.element.group.dirty = true;
    props.element.group._objects[1].set('fill', textColor.value);
    baseStore.canvas.renderAll();
};

const updateTextFontFamily = async () => {
    if (!props.element || !baseStore.canvas) return;
    const textElement = getElementByType('metric-text');
    if (textElement) {
        // 加载新字体
        await fontStore.loadFont(textFontFamily.value);
        
        // 确保字体已加载
        document.fonts.ready.then(() => {
            textElement.set('fontFamily', textFontFamily.value);
            baseStore.canvas.renderAll();
        });
    }
};

// 位置更新方法
const updatePosition = () => {
    if (!props.element || !baseStore.canvas) {
        return;
    }
    
    // 更新图标位置
    if (props.element.group) {
        props.element.group.set({
            left: positionX.value,
            top: positionY.value
        });
    }
    
    baseStore.canvas.renderAll();
};

// 更新水平对齐方式的方法
const updateLayout = (value) => {
    if (!props.element || !baseStore.canvas) return;
    
    const obj = props.element.group;
    if (!obj) return;
    obj.set({
        originX: value
    });

    // originX.value = value;
    // 保持positionX不变
    baseStore.canvas.renderAll();
};
</script>

<style scoped>
@import '@/assets/styles/settings.css';
</style>
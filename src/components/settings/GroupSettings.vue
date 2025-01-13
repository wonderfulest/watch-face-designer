<template>
    <div class="settings-group">
        <h3>数据组设置</h3>
        <div>{{ props.elements[0].metricGroup }}</div>
        <div class="setting-item" v-if="mayMetricGroup">
            <label>作为数据组</label>
            <el-switch
                v-model="isMetricGroup"
                size="large"
                active-text="是"
                inactive-text="否"
                @change="changeMetricGroup"
            />
        </div>
        <div class="setting-item" v-if="mayMetricGroup && isMetricGroup">
            <label>数据类型</label>
            <select v-model="metricSymbol" @change="updateMetricType">
                <option v-for="(option, index) in DataTypeOptions" :key="index" :value="option.metricSymbol">
                {{ option.label }}
                </option>
            </select>
        </div>
        <div class="setting-item" v-if="isSameTypeLayer">
            <label>对齐方式</label>
            <div class="align-buttons">
                <button 
                    v-for="align in originXOptions" 
                    :key="align.value"
                    @click="updateOriginX(align.value)"
                    :class="{ active: originX === align.value }"
                    :title="align.label"
                >
                    <Icon :icon="align.icon" />
                </button>
            </div>
        </div>
        <div class="setting-item" v-if="isSameTypeLayer">
            <label>字体大小</label>
            <select v-model.number="fontSize" @change="updateFontSize">
                <option v-for="size in fontSizes" :key="size" :value="size">
                    {{ size }}px
                </option>
            </select>
        </div>
        <div class="setting-item" v-if="isSameTypeLayer">
            <label>字体颜色</label>
            <color-picker 
                v-model="textColor"
                @change="updateTextColor"
            />
        </div>
        <div class="setting-item" v-if="isSameTypeLayer">
            <label>字体</label>
            <font-picker 
                v-model="fontFamily"
                @change="updateFontFamily"
            />
        </div>
    </div>
</template>

<script setup>
import { ref, watch, computed, onMounted, onUnmounted } from 'vue';
import { debounce } from 'lodash-es';
import moment from 'moment';
import emitter from '@/utils/eventBus';
import { nanoid } from 'nanoid';
import { DataTypeOptions, getMetricBySymbol } from '@/config/settings'
import { useBaseStore } from '@/stores/base';
import { useFontStore } from '@/stores/fontStore';
import { fontSizes, originXOptions } from '@/config/settings';
import ColorPicker from '@/components/color-picker/index.vue';
import FontPicker from '@/components/font-picker/index.vue';

const baseStore = useBaseStore();
const fontStore = useFontStore();

const props = defineProps({
    elements: {
        type: Array,
        required: true,
        default: () => []
    },
});

const getElementByType = (type) => {
    return props.elements.find(obj => obj.eleType === type);
};

// 设置项的响应式状态
const groupElement = props.elements;
const iconElement = computed(() => getElementByType('icon'));
const dataElement = computed(() => getElementByType('data'));
const labelElement = computed(() => getElementByType('label'));
const progressRingElement = computed(() => getElementByType('progressRing'));

const isMetricGroup = ref(false);
const isGoalGroup = ref(false);
const fontSize = ref(props.elements[0].fontSize || 36);
const textColor = ref(props.elements[0].fill || '#FFFFFF');
const fontFamily = ref(props.elements[0].fontFamily || 'Arial');
const positionX = ref(Math.round(props.elements[0].left || 0));
const positionY = ref(Math.round(props.elements[0].top || 0));
const originX = ref(props.elements[0].originX || 'center');
const metricSymbol = ref(dataElement.value?.metricSymbol || ':FIELD_TYPE_HEART_RATE');

onMounted(async () => {
    let firstMetricGroup;
    let firstGoalGroup;
    isMetricGroup.value = false;
    isGoalGroup.value = false;
    
    for (const element of props.elements) {
        if (element.metricGroup === undefined) {
            isMetricGroup.value = false;
            return;
        }
        
        if (firstMetricGroup === undefined) {
            firstMetricGroup = element.metricGroup;
        } else if (firstMetricGroup !== element.metricGroup) {
            isMetricGroup.value = false;
            return;
        }
    }
    
    isMetricGroup.value = true;
});

// 可能是数据组
// 条件是：只有一个data
const mayMetricGroup = computed(()=>{
    const dataElements = props.elements.filter(element => element.eleType === 'data');
    if (dataElements.length !== 1) return false;
    return true
})

const isSameTypeLayer = computed(() => {
    if (props.elements.length <= 1) {
        return true;
    }
    const firstType = props.elements[0].eleType;
    return props.elements.every(element => element.eleType === firstType);
})

const updateFontSize = () => {
    for (const element of props.elements) {
        element.set('fontSize', fontSize.value);
    } 
    baseStore.canvas.renderAll();
};

const updateTextColor = () => {
    for (const element of props.elements) {
        element.set('fill', textColor.value);
    }
    baseStore.canvas.renderAll();
};

const updateFontFamily = () => {
    for (const element of props.elements) {
        element.set('fontFamily', fontFamily.value);
    } 
    baseStore.canvas.renderAll();
};

const updateOriginX = (originX) => {
    for (const element of props.elements) {
        element.set('originX', originX);
    } 
    originX.value = originX;
    element.setCoords();
    baseStore.canvas.renderAll();
};

const updateMetricType = () => {
    const metric = getMetricBySymbol(metricSymbol.value)
    for (let element of props.elements) {
        element.set({
            'metricSymbol': metric.metricSymbol,
        });
    }
    iconElement.value && iconElement.value.set('text', metric.icon);
    dataElement.value && dataElement.value.set('text', metric.defaultValue);
    labelElement.value && labelElement.value.set('text', metric.enLabel);
    progressRingElement.value && progressRingElement.value.set('text', metric.defaultValue);

    baseStore.canvas.renderAll();
};

const changeMetricGroup = (isMetricGroup) => {
    const groupId = nanoid()
    for (const element of props.elements) {
        if (isMetricGroup) {
            element.set({'metricGroup': groupId});
          
        } else {
            delete element['metricGroup']
        }
    }
    if (isMetricGroup) {
        updateMetricType();
    }
}
</script>

<style scoped>
@import '@/assets/styles/settings.css';
.example-text {
    color: #555;
    margin-left: 1em; /* 使用制表符对齐 */
}

/* 添加图标样式 */
.align-buttons .iconify {
    font-size: 18px;
}
</style> 
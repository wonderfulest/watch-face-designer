import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { loadFonts } from '@/config/fonts'
import '@iconify/iconify'; 

import '@/assets/styles/fonts.css'
import '@/assets/styles/main.css'

import ElementPlus from 'element-plus'
import 'element-plus/theme-chalk/src/index.scss';
import '@/assets/styles/element-variables.scss';

import emitter from '@/utils/eventBus';
import { useAuthStore } from '@/stores/auth'

// 等待字体和图标加载完成后再创建应用
Promise.all([
    loadFonts(),
]).then(() => {
    const app = createApp(App)

    app.use(ElementPlus)
    app.use(createPinia())

    // 初始化认证状态
    const authStore = useAuthStore()
    authStore.initAuth()

    app.use(router)
    app.component('Icon', {
        props: {
            icon: {
            type: String,
            required: true,
            },
            className: {
            type: String,
            default: '',
            },
        },
        template: `<span class="iconify" :data-icon="icon" :class="className" data-inline="false"></span>`,
    });
    app.config.errorHandler = (err, vm, info) => {
        console.error('全局错误捕获：', err, info);
    };
    app.config.globalProperties.$emitter = emitter;
    app.mount('#app')
}).catch(error => {
    console.error('应用初始化失败:', error)
})

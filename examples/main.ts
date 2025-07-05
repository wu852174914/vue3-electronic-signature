import { createApp } from 'vue'
import App from './App.vue'

// 导入组件库
import Vue3ElectronicSignature from '../src'

const app = createApp(App)

// 注册组件库
app.use(Vue3ElectronicSignature)

app.mount('#app')
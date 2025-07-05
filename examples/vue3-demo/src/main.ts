/**
 * 雅致PDF预览器 - Vue3演示应用入口
 * 
 * 本文件是Vue3演示应用的主入口文件
 * 展示如何在Vue3项目中集成雅致PDF预览器
 */

import { createApp } from 'vue'
import App from './App.vue'

// 创建Vue应用实例
const app = createApp(App)

// 挂载应用
app.mount('#app')

// 开发环境下的调试信息
if (import.meta.env.DEV) {
  console.log('🎨 雅致PDF预览器 Vue3演示应用已启动')
  console.log('📦 Vue版本:', app.version)
}

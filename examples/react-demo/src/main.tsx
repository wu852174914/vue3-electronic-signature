/**
 * 雅致PDF预览器 - React演示应用入口
 * 
 * 本文件是React演示应用的主入口文件
 * 展示如何在React项目中集成雅致PDF预览器
 */

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'

// 创建React应用根节点
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
)

// 渲染应用
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

// 开发环境下的调试信息
if (import.meta.env.DEV) {
  console.log('🎨 雅致PDF预览器 React演示应用已启动')
  console.log('⚛️ React版本:', React.version)
}

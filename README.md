# Vue3 电子签名组件库

一个功能强大、易于使用的Vue3电子签名组件库，支持手写签名、触摸绘制和多种导出格式。

## ✨ 特性

- 🖊️ **流畅绘制** - 基于Canvas的高性能绘图引擎
- 📱 **移动端支持** - 完美支持触摸设备和手势操作
- 🎨 **高度可定制** - 丰富的配置选项和样式定制
- 📤 **多格式导出** - 支持PNG、JPEG、SVG、Base64等格式
- 🔄 **撤销重做** - 完整的操作历史管理
- 📏 **响应式设计** - 自适应容器尺寸
- 💪 **TypeScript** - 完整的类型定义支持
- 🎯 **压感模拟** - 根据绘制速度模拟压感效果
- 🖼️ **图像处理** - 内置裁剪、缩放、水印等功能

## 📦 安装

```bash
npm install vue3-electronic-signature
```

或者使用 yarn：

```bash
yarn add vue3-electronic-signature
```

## 🚀 快速开始

### 全局注册

```typescript
import { createApp } from 'vue'
import Vue3ElectronicSignature from 'vue3-electronic-signature'
import App from './App.vue'

const app = createApp(App)
app.use(Vue3ElectronicSignature)
app.mount('#app')
```

### 局部引入

```vue
<template>
  <ElectronicSignature
    :width="400"
    :height="200"
    placeholder="请在此处签名"
    @signature-end="onSignatureEnd"
  />
</template>

<script setup lang="ts">
import { ElectronicSignature } from 'vue3-electronic-signature'
import type { SignatureData } from 'vue3-electronic-signature'

const onSignatureEnd = (data: SignatureData) => {
  console.log('签名完成', data)
}
</script>
```

## 📖 基础用法

### 简单签名

```vue
<template>
  <ElectronicSignature
    :width="400"
    :height="200"
    stroke-color="#000000"
    :stroke-width="2"
    placeholder="请在此处签名"
  />
</template>
```

### 自定义样式

```vue
<template>
  <ElectronicSignature
    :width="500"
    :height="300"
    stroke-color="#2196F3"
    :stroke-width="3"
    background-color="#FFFEF7"
    border-style="2px solid #2196F3"
    border-radius="8px"
    :smoothing="true"
    :pressure-sensitive="true"
    placeholder="自定义样式签名"
  />
</template>
```

### 响应式签名

```vue
<template>
  <ElectronicSignature
    width="100%"
    :height="200"
    stroke-color="#4CAF50"
    placeholder="响应式签名区域"
  />
</template>
```

## 🔧 API 文档

### Props 属性

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| width | number \| string | '100%' | 画布宽度 |
| height | number \| string | 300 | 画布高度 |
| strokeColor | string | '#000000' | 画笔颜色 |
| strokeWidth | number | 2 | 画笔粗细 |
| backgroundColor | string | 'transparent' | 背景颜色 |
| disabled | boolean | false | 是否禁用 |
| placeholder | string | '请在此处签名' | 占位符文本 |
| smoothing | boolean | true | 是否启用平滑绘制 |
| pressureSensitive | boolean | false | 是否启用压感效果 |
| minStrokeWidth | number | 1 | 最小画笔宽度（压感模式） |
| maxStrokeWidth | number | 4 | 最大画笔宽度（压感模式） |
| borderStyle | string | '1px solid #ddd' | 边框样式 |
| borderRadius | string | '4px' | 圆角大小 |
| showToolbar | boolean | false | 是否显示工具栏 |

### Events 事件

| 事件名 | 参数 | 说明 |
|--------|------|------|
| signature-start | - | 开始签名时触发 |
| signature-drawing | (data: SignatureData) | 签名进行中触发 |
| signature-end | (data: SignatureData) | 签名结束时触发 |
| signature-clear | - | 清除签名时触发 |
| signature-undo | (data: SignatureData) | 撤销操作时触发 |
| signature-redo | (data: SignatureData) | 重做操作时触发 |

### Methods 方法

| 方法名 | 参数 | 返回值 | 说明 |
|--------|------|--------|------|
| clear() | - | void | 清除签名 |
| undo() | - | void | 撤销上一步操作 |
| redo() | - | void | 重做操作 |
| save(options?) | ExportOptions | string | 保存签名 |
| isEmpty() | - | boolean | 判断签名是否为空 |
| fromDataURL(dataURL) | string | Promise\<void\> | 从数据URL加载签名 |
| getSignatureData() | - | SignatureData | 获取签名数据 |
| setSignatureData(data) | SignatureData | void | 设置签名数据 |
| resize(width?, height?) | number?, number? | void | 调整画布尺寸 |

## 📋 类型定义

### SignatureData

```typescript
interface SignatureData {
  paths: SignaturePath[]        // 签名路径集合
  canvasSize: {                // 画布尺寸
    width: number
    height: number
  }
  timestamp: number            // 创建时间戳
  isEmpty: boolean             // 是否为空
}
```

### ExportOptions

```typescript
interface ExportOptions {
  format: 'png' | 'jpeg' | 'svg' | 'base64'  // 导出格式
  quality?: number                            // 图片质量(0-1)
  size?: {                                   // 导出尺寸
    width: number
    height: number
  }
  backgroundColor?: string                    // 背景颜色
}
```

## 🎯 高级用法

### 获取和设置签名数据

```vue
<template>
  <ElectronicSignature ref="signatureRef" />
  <button @click="saveSignature">保存</button>
  <button @click="loadSignature">加载</button>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { SignatureMethods, SignatureData } from 'vue3-electronic-signature'

const signatureRef = ref<SignatureMethods>()
let savedData: SignatureData | null = null

const saveSignature = () => {
  if (signatureRef.value) {
    savedData = signatureRef.value.getSignatureData()
    console.log('签名已保存', savedData)
  }
}

const loadSignature = () => {
  if (signatureRef.value && savedData) {
    signatureRef.value.setSignatureData(savedData)
    console.log('签名已加载')
  }
}
</script>
```

### 导出不同格式

```typescript
// 导出PNG格式
const pngData = signatureRef.value?.save({ format: 'png' })

// 导出高质量JPEG
const jpegData = signatureRef.value?.save({ 
  format: 'jpeg', 
  quality: 0.9 
})

// 导出SVG矢量格式
const svgData = signatureRef.value?.save({ format: 'svg' })

// 导出指定尺寸
const resizedData = signatureRef.value?.save({
  format: 'png',
  size: { width: 800, height: 400 },
  backgroundColor: '#ffffff'
})
```

### 工具函数使用

组件库还提供了丰富的工具函数：

```typescript
import {
  getSignatureBounds,
  cropSignature,
  addWatermark,
  convertToGrayscale
} from 'vue3-electronic-signature'

// 获取签名边界
const bounds = getSignatureBounds(signatureData)

// 裁剪签名
const croppedCanvas = cropSignature(canvas, signatureData, 10)

// 添加水印
const watermarkedCanvas = addWatermark(canvas, '© 2024 公司名称', {
  position: 'bottom-right',
  fontSize: 12,
  opacity: 0.5
})

// 转换为灰度
const grayscaleCanvas = convertToGrayscale(canvas)
```

## 🎨 样式定制

### CSS 变量

组件支持通过CSS变量进行样式定制：

```css
.electronic-signature {
  --signature-border-color: #ddd;
  --signature-border-radius: 4px;
  --signature-placeholder-color: #999;
  --signature-toolbar-bg: #f5f5f5;
}
```

### 自定义主题

```vue
<template>
  <ElectronicSignature
    class="custom-signature"
    :width="400"
    :height="200"
  />
</template>

<style>
.custom-signature {
  border: 2px solid #2196F3;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.15);
}

.custom-signature canvas {
  border-radius: 10px;
}
</style>
```

## 📱 移动端优化

组件针对移动端进行了特别优化：

- 支持触摸绘制
- 防止页面滚动干扰
- 高DPI屏幕适配
- 触摸压感模拟

```vue
<template>
  <!-- 移动端推荐配置 -->
  <ElectronicSignature
    width="100%"
    :height="250"
    :stroke-width="3"
    :pressure-sensitive="true"
    :min-stroke-width="2"
    :max-stroke-width="6"
    stroke-color="#2196F3"
  />
</template>
```

## 🔧 开发指南

### 本地开发

```bash
# 克隆项目
git clone https://github.com/your-username/vue3-electronic-signature.git

# 安装依赖
cd vue3-electronic-signature
npm install

# 启动开发服务器
npm run dev

# 构建组件库
npm run build:lib
```

### 项目结构

```
vue3-electronic-signature/
├── src/                    # 源代码
│   ├── components/         # 组件
│   ├── types/             # 类型定义
│   ├── utils/             # 工具函数
│   └── index.ts           # 入口文件
├── examples/              # 示例应用
├── dist/                  # 构建输出
├── docs/                  # 文档
└── tests/                 # 测试文件
```

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目基于 [MIT](LICENSE) 许可证开源。


## 📞 支持

如果你觉得这个项目有用，请给我们一个 ⭐️！

- 📧 邮箱：852174914@qq.com
- 🐛 问题反馈：[GitHub Issues](https://github.com/wu852174914/vue3-electronic-signature/issues)
```

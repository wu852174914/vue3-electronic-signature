# Vue3 电子签名组件库

一个功能强大、易于使用的Vue3电子签名组件库，支持手写签名、触摸绘制和多种导出格式。

## ✨ 特性

- 🖊️ **流畅绘制** - 基于Canvas的高性能绘图引擎，连续流畅的书写体验
- 📱 **移动端支持** - 完美支持触摸设备和手势操作
- 🎨 **多种笔迹样式** - 适中笔迹（默认）、优雅笔迹、毛笔、铅笔等专业笔迹效果
- ✨ **智能渐变** - 优雅笔迹支持基于速度和压力的由粗到细渐变效果
- 🚫 **无闪烁渲染** - 所有笔迹样式都支持稳定的实时渲染，无闪烁干扰
- 📤 **多格式导出** - 支持PNG、JPEG、SVG、Base64等格式
- 🔄 **撤销重做** - 完整的操作历史管理
- 📏 **响应式设计** - 自适应容器尺寸
- 💪 **TypeScript** - 完整的类型定义支持
- 🎯 **压感模拟** - 根据绘制速度模拟压感效果
- 🖼️ **图像处理** - 内置裁剪、缩放、水印等功能
- 🎬 **签名回放** - 支持签名路径的录制和回放功能，保持笔迹样式一致性

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

### 笔迹样式选择

```vue
<template>
  <div>
    <!-- 样式选择器 -->
    <select v-model="selectedPenStyle">
      <option value="ballpoint">适中笔迹 - 连续流畅，商务首选（默认）</option>
      <option value="elegant">优雅笔迹 - 智能渐变，由粗到细</option>
      <option value="brush">毛笔 - 传统书法，自然变化</option>
      <option value="pencil">铅笔 - 稳定连续，素描效果</option>
      <option value="pen">钢笔 - 极细锐利，精准线条</option>
      <option value="marker">马克笔 - 超粗荧光，醒目标记</option>
    </select>

    <!-- 签名组件 -->
    <ElectronicSignature
      :width="400"
      :height="200"
      :pen-style="selectedPenStyle"
      stroke-color="#2c3e50"
      placeholder="选择不同笔迹样式体验"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElectronicSignature } from 'vue3-electronic-signature'
import type { PenStyle } from 'vue3-electronic-signature'

const selectedPenStyle = ref<PenStyle>('ballpoint') // 默认适中笔迹
</script>
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
| **penStyle** | **PenStyle** | **'ballpoint'** | **笔迹样式：'ballpoint'（适中） \| 'elegant'（优雅） \| 'brush'（毛笔） \| 'pencil'（铅笔） \| 'pen'（钢笔） \| 'marker'（马克笔）** |
| strokeColor | string | '#000000' | 画笔颜色 |
| strokeWidth | number | 2 | 画笔粗细（部分样式会覆盖此设置） |
| backgroundColor | string | 'transparent' | 背景颜色 |
| disabled | boolean | false | 是否禁用 |
| placeholder | string | '请在此处签名' | 占位符文本 |
| smoothing | boolean | true | 是否启用平滑绘制（部分样式会覆盖此设置） |
| pressureSensitive | boolean | false | 是否启用压感效果（部分样式会覆盖此设置） |
| minStrokeWidth | number | 1 | 最小画笔宽度（压感模式） |
| maxStrokeWidth | number | 4 | 最大画笔宽度（压感模式） |
| borderStyle | string | '1px solid #ddd' | 边框样式 |
| borderRadius | string | '4px' | 圆角大小 |
| showToolbar | boolean | false | 是否显示工具栏 |
| replayMode | boolean | false | 是否启用回放模式 |
| replayData | SignatureReplay | - | 回放数据 |
| replayOptions | ReplayOptions | - | 回放选项配置 |

### Events 事件

| 事件名 | 参数 | 说明 |
|--------|------|------|
| signature-start | - | 开始签名时触发 |
| signature-drawing | (data: SignatureData) | 签名进行中触发 |
| signature-end | (data: SignatureData) | 签名结束时触发 |
| signature-clear | - | 清除签名时触发 |
| signature-undo | (data: SignatureData) | 撤销操作时触发 |
| signature-redo | (data: SignatureData) | 重做操作时触发 |
| replay-start | - | 回放开始时触发 |
| replay-progress | (progress: number, currentTime: number) | 回放进度更新时触发 |
| replay-pause | - | 回放暂停时触发 |
| replay-resume | - | 回放恢复时触发 |
| replay-stop | - | 回放停止时触发 |
| replay-complete | - | 回放完成时触发 |
| replay-path-start | (pathIndex: number, path: SignaturePath) | 笔画开始时触发 |
| replay-path-end | (pathIndex: number, path: SignaturePath) | 笔画结束时触发 |
| replay-speed-change | (speed: number) | 回放速度改变时触发 |

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
| startReplay(data, options?) | SignatureReplay, ReplayOptions? | void | 开始回放签名 |
| getReplayData() | - | SignatureReplay \| null | 获取回放数据 |
| setReplayMode(enabled) | boolean | void | 设置回放模式 |
| play() | - | void | 播放回放 |
| pause() | - | void | 暂停回放 |
| stop() | - | void | 停止回放 |
| seek(time) | number | void | 跳转到指定时间 |
| setSpeed(speed) | number | void | 设置回放速度 |
| getState() | - | ReplayState | 获取回放状态 |
| getCurrentTime() | - | number | 获取当前回放时间 |
| getTotalDuration() | - | number | 获取总回放时长 |
| getProgress() | - | number | 获取回放进度(0-1) |

### 🎨 笔迹样式详解

| 样式 | 特点 | 视觉效果 | 适用场景 |
|------|------|----------|----------|
| **ballpoint** ⭐ | 连续流畅线条(2px) | 简洁专业，圆润收笔 | 商务签名、日常使用（默认） |
| **elegant** ✨ | 智能渐变(0.3-15px) | 由粗到细，速度感应 | 艺术签名、书法体验 |
| **brush** 🖌️ | 传统毛笔(1-20px) | 自然变化，书法韵味 | 传统书法、艺术创作 |
| **pencil** ✏️ | 稳定连续(2-5px) | 简洁清晰，无纹理 | 草稿签名、自然书写 |
| **pen** 🖊️ | 极细锐利线条(1px) | 商务精准，无圆角端点 | 精密绘图、技术签名 |
| **marker** 🖍️ | 超粗荧光效果(12px) | 荧光光晕，醒目标记 | 重点标记、醒目签名 |

#### 笔迹样式配置

```typescript
import { getAllPenStyles, getPenStyleConfig } from 'vue3-electronic-signature'

// 获取所有可用样式
const allStyles = getAllPenStyles()

// 获取特定样式配置
const penConfig = getPenStyleConfig('elegant')
console.log(penConfig)
// {
//   name: '优雅笔迹',
//   description: '智能渐变，由粗到细，速度感应',
//   strokeWidth: 3,
//   smoothing: true,
//   pressure: { enabled: true, min: 1, max: 16 },
//   lineCap: 'round',
//   lineJoin: 'round',
//   recommendedColor: '#2c3e50'
// }
```

## 📋 类型定义

### PenStyle

```typescript
type PenStyle = 'ballpoint' | 'elegant' | 'brush' | 'pencil' | 'pen' | 'marker'
```

### PenStyleConfig

```typescript
interface PenStyleConfig {
  name: string                    // 样式名称
  description: string             // 样式描述
  strokeWidth: number             // 基础线宽
  smoothing: boolean              // 是否启用平滑
  pressure: {                     // 压感配置
    enabled: boolean
    min: number
    max: number
  }
  lineCap: CanvasLineCap          // 线条端点样式
  lineJoin: CanvasLineJoin        // 线条连接样式
  recommendedColor?: string       // 推荐颜色
}
```

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

### SignatureReplay

```typescript
interface SignatureReplay {
  paths: SignaturePath[]                     // 带时间信息的路径集合
  totalDuration: number                      // 总回放时长（毫秒）
  speed: number                              // 回放速度倍率
  metadata: {                                // 签名元数据
    deviceType: 'mouse' | 'touch' | 'pen'
    averageSpeed: number                     // 平均书写速度（像素/秒）
    totalDistance: number                    // 总绘制距离（像素）
    averagePauseTime: number                 // 笔画间平均停顿时间（毫秒）
  }
}
```

### ReplayOptions

```typescript
interface ReplayOptions {
  speed?: number                             // 回放速度倍率
  loop?: boolean                             // 是否循环播放
  showControls?: boolean                     // 是否显示控制条
  autoPlay?: boolean                         // 是否自动开始播放
  startTime?: number                         // 回放开始时间（毫秒）
  endTime?: number                           // 回放结束时间（毫秒）
}
```

### ReplayState

```typescript
type ReplayState = 'idle' | 'playing' | 'paused' | 'stopped' | 'completed'
```

## � 签名回放功能

### 基础回放

```vue
<template>
  <div>
    <!-- 签名组件 -->
    <ElectronicSignature
      ref="signatureRef"
      :width="400"
      :height="200"
      @signature-end="onSignatureEnd"
    />

    <!-- 回放组件 -->
    <ElectronicSignature
      :width="400"
      :height="200"
      :replay-mode="true"
      :replay-data="replayData"
      :replay-options="replayOptions"
      @replay-complete="onReplayComplete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { SignatureMethods, SignatureData, SignatureReplay } from 'vue3-electronic-signature'

const signatureRef = ref<SignatureMethods>()
const replayData = ref<SignatureReplay | null>(null)

const replayOptions = {
  speed: 1,
  loop: false,
  showControls: true,
  autoPlay: true
}

const onSignatureEnd = (data: SignatureData) => {
  // 从签名数据生成回放数据
  replayData.value = signatureRef.value?.getReplayData() || null
}

const onReplayComplete = () => {
  console.log('回放完成')
}
</script>
```

### 手动控制回放

```vue
<template>
  <div>
    <ElectronicSignature
      ref="replayRef"
      :width="400"
      :height="200"
      :replay-mode="true"
      :replay-data="replayData"
      :replay-options="{ showControls: false, autoPlay: false }"
      @replay-progress="onProgress"
    />

    <!-- 自定义控制按钮 -->
    <div class="custom-controls">
      <button @click="play">播放</button>
      <button @click="pause">暂停</button>
      <button @click="stop">停止</button>
      <button @click="setSpeed(0.5)">0.5x</button>
      <button @click="setSpeed(1)">1x</button>
      <button @click="setSpeed(2)">2x</button>
    </div>

    <div>进度: {{ Math.round(progress * 100) }}%</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { SignatureMethods } from 'vue3-electronic-signature'

const replayRef = ref<SignatureMethods>()
const progress = ref(0)

const play = () => replayRef.value?.play()
const pause = () => replayRef.value?.pause()
const stop = () => replayRef.value?.stop()
const setSpeed = (speed: number) => replayRef.value?.setSpeed(speed)

const onProgress = (progressValue: number) => {
  progress.value = progressValue
}
</script>
```

### 回放事件监听

```vue
<template>
  <ElectronicSignature
    :replay-mode="true"
    :replay-data="replayData"
    @replay-start="onReplayStart"
    @replay-path-start="onPathStart"
    @replay-path-end="onPathEnd"
    @replay-complete="onReplayComplete"
  />
</template>

<script setup lang="ts">
import type { SignaturePath } from 'vue3-electronic-signature'

const onReplayStart = () => {
  console.log('开始回放签名')
}

const onPathStart = (pathIndex: number, path: SignaturePath) => {
  console.log(`开始绘制第 ${pathIndex + 1} 笔画`, path)
}

const onPathEnd = (pathIndex: number, path: SignaturePath) => {
  console.log(`完成绘制第 ${pathIndex + 1} 笔画`, path)
}

const onReplayComplete = () => {
  console.log('签名回放完成')
}
</script>
```

## �🎯 高级用法

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

## 📝 更新日志

### v2.0.0 (最新版本)

#### 🎉 重大改进
- **删除所有断续效果** - 实现连续流畅的书写体验
- **优化优雅笔迹** - 增强由粗到细的渐变效果，删除黑色连接点
- **修复闪烁问题** - 毛笔和圆珠笔书写时的稳定渲染
- **默认笔迹调整** - 全局默认使用适中笔迹（ballpoint）

#### ✨ 笔迹样式优化
- **适中笔迹** - 连续流畅，简洁专业，商务首选（新默认）
- **优雅笔迹** - 智能渐变，由粗到细，速度感应（增强效果）
- **毛笔笔迹** - 传统书法，自然变化，稳定无闪烁
- **铅笔笔迹** - 稳定连续，简洁清晰，删除纹理效果
- **钢笔笔迹** - 极细锐利，精准线条
- **马克笔笔迹** - 超粗荧光，醒目标记

#### 🔧 技术改进
- **性能优化** - 删除复杂算法，文件大小减少至53.46kB
- **代码简化** - 移除断续效果和连接点算法
- **渲染一致性** - 实时书写与最终效果完全一致
- **回放稳定性** - 录制与回放效果完全相同

```

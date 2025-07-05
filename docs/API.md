# API 文档

## ElectronicSignature 组件

### Props 属性详解

#### width
- **类型**: `number | string`
- **默认值**: `'100%'`
- **说明**: 画布宽度，支持数字（像素）或字符串（如 '100%', '400px'）

```vue
<!-- 固定宽度 -->
<ElectronicSignature :width="400" />

<!-- 响应式宽度 -->
<ElectronicSignature width="100%" />
```

#### height
- **类型**: `number | string`
- **默认值**: `300`
- **说明**: 画布高度

```vue
<ElectronicSignature :height="200" />
<ElectronicSignature height="300px" />
```

#### strokeColor
- **类型**: `string`
- **默认值**: `'#000000'`
- **说明**: 画笔颜色，支持任何有效的CSS颜色值

```vue
<ElectronicSignature stroke-color="#2196F3" />
<ElectronicSignature stroke-color="rgb(33, 150, 243)" />
<ElectronicSignature stroke-color="blue" />
```

#### strokeWidth
- **类型**: `number`
- **默认值**: `2`
- **说明**: 画笔粗细（像素）

```vue
<ElectronicSignature :stroke-width="3" />
```

#### backgroundColor
- **类型**: `string`
- **默认值**: `'transparent'`
- **说明**: 画布背景颜色

```vue
<ElectronicSignature background-color="#FFFEF7" />
<ElectronicSignature background-color="transparent" />
```

#### disabled
- **类型**: `boolean`
- **默认值**: `false`
- **说明**: 是否禁用签名功能

```vue
<ElectronicSignature :disabled="true" />
```

#### placeholder
- **类型**: `string`
- **默认值**: `'请在此处签名'`
- **说明**: 空白状态下显示的占位符文本

```vue
<ElectronicSignature placeholder="请在此区域签名" />
```

#### smoothing
- **类型**: `boolean`
- **默认值**: `true`
- **说明**: 是否启用平滑绘制（贝塞尔曲线）

```vue
<ElectronicSignature :smoothing="false" />
```

#### pressureSensitive
- **类型**: `boolean`
- **默认值**: `false`
- **说明**: 是否启用压感效果（根据绘制速度调整线条粗细）

```vue
<ElectronicSignature :pressure-sensitive="true" />
```

#### minStrokeWidth
- **类型**: `number`
- **默认值**: `1`
- **说明**: 压感模式下的最小画笔宽度

```vue
<ElectronicSignature 
  :pressure-sensitive="true"
  :min-stroke-width="1"
  :max-stroke-width="6"
/>
```

#### maxStrokeWidth
- **类型**: `number`
- **默认值**: `4`
- **说明**: 压感模式下的最大画笔宽度

#### borderStyle
- **类型**: `string`
- **默认值**: `'1px solid #ddd'`
- **说明**: 画布边框样式

```vue
<ElectronicSignature border-style="2px dashed #2196F3" />
```

#### borderRadius
- **类型**: `string`
- **默认值**: `'4px'`
- **说明**: 画布圆角大小

```vue
<ElectronicSignature border-radius="8px" />
```

#### showToolbar
- **类型**: `boolean`
- **默认值**: `false`
- **说明**: 是否显示内置工具栏（清除、撤销、重做按钮）

```vue
<ElectronicSignature :show-toolbar="true" />
```

### Events 事件详解

#### signature-start
- **参数**: 无
- **说明**: 用户开始签名时触发

```vue
<ElectronicSignature @signature-start="onSignatureStart" />
```

#### signature-drawing
- **参数**: `(data: SignatureData)`
- **说明**: 签名进行中实时触发

```vue
<ElectronicSignature @signature-drawing="onSignatureDrawing" />
```

#### signature-end
- **参数**: `(data: SignatureData)`
- **说明**: 用户完成一次签名笔画时触发

```vue
<ElectronicSignature @signature-end="onSignatureEnd" />
```

#### signature-clear
- **参数**: 无
- **说明**: 清除签名时触发

```vue
<ElectronicSignature @signature-clear="onSignatureClear" />
```

#### signature-undo
- **参数**: `(data: SignatureData)`
- **说明**: 撤销操作时触发

```vue
<ElectronicSignature @signature-undo="onSignatureUndo" />
```

#### signature-redo
- **参数**: `(data: SignatureData)`
- **说明**: 重做操作时触发

```vue
<ElectronicSignature @signature-redo="onSignatureRedo" />
```

### Methods 方法详解

#### clear()
清除画布上的所有签名内容

```typescript
const signatureRef = ref<SignatureMethods>()

const clearSignature = () => {
  signatureRef.value?.clear()
}
```

#### undo()
撤销上一步绘制操作

```typescript
const undoLastAction = () => {
  signatureRef.value?.undo()
}
```

#### redo()
重做之前撤销的操作

```typescript
const redoLastAction = () => {
  signatureRef.value?.redo()
}
```

#### save(options?: ExportOptions)
保存签名为指定格式

**参数**:
- `options`: 导出选项（可选）

**返回值**: `string` - 导出的数据

```typescript
// 默认导出PNG格式
const pngData = signatureRef.value?.save()

// 导出JPEG格式
const jpegData = signatureRef.value?.save({
  format: 'jpeg',
  quality: 0.9
})

// 导出SVG格式
const svgData = signatureRef.value?.save({
  format: 'svg'
})

// 导出Base64格式
const base64Data = signatureRef.value?.save({
  format: 'base64'
})

// 导出指定尺寸
const resizedData = signatureRef.value?.save({
  format: 'png',
  size: { width: 800, height: 400 },
  backgroundColor: '#ffffff'
})
```

#### isEmpty()
判断当前签名是否为空

**返回值**: `boolean`

```typescript
const checkEmpty = () => {
  const empty = signatureRef.value?.isEmpty()
  console.log('签名为空:', empty)
}
```

#### fromDataURL(dataURL: string)
从数据URL加载图片到画布

**参数**:
- `dataURL`: 图片的数据URL

**返回值**: `Promise<void>`

```typescript
const loadImage = async () => {
  const dataURL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...'
  await signatureRef.value?.fromDataURL(dataURL)
}
```

#### getSignatureData()
获取当前签名的完整数据

**返回值**: `SignatureData`

```typescript
const getSignature = () => {
  const data = signatureRef.value?.getSignatureData()
  console.log('签名数据:', data)
}
```

#### setSignatureData(data: SignatureData)
设置签名数据

**参数**:
- `data`: 签名数据对象

```typescript
const loadSignature = (savedData: SignatureData) => {
  signatureRef.value?.setSignatureData(savedData)
}
```

#### resize(width?: number, height?: number)
调整画布尺寸

**参数**:
- `width`: 新宽度（可选）
- `height`: 新高度（可选）

```typescript
const resizeCanvas = () => {
  signatureRef.value?.resize(500, 300)
}
```

## 🎬 回放功能 API

### 回放相关属性

#### replayMode
- **类型**: `boolean`
- **默认值**: `false`
- **说明**: 是否启用回放模式

```vue
<ElectronicSignature :replay-mode="true" />
```

#### replayData
- **类型**: `SignatureReplay | undefined`
- **默认值**: `undefined`
- **说明**: 回放数据对象

```vue
<ElectronicSignature
  :replay-mode="true"
  :replay-data="replayData"
/>
```

#### replayOptions
- **类型**: `ReplayOptions | undefined`
- **默认值**: `undefined`
- **说明**: 回放选项配置

```vue
<ElectronicSignature
  :replay-mode="true"
  :replay-data="replayData"
  :replay-options="{
    speed: 1.5,
    loop: true,
    showControls: true,
    autoPlay: false
  }"
/>
```

### 回放控制方法

#### startReplay(data: SignatureReplay, options?: ReplayOptions)
开始回放签名

**参数**:
- `data`: 回放数据对象
- `options`: 回放选项（可选）

```typescript
const startReplay = () => {
  const replayData = signatureRef.value?.getReplayData()
  if (replayData) {
    signatureRef.value?.startReplay(replayData, {
      speed: 1,
      loop: false,
      showControls: true,
      autoPlay: true
    })
  }
}
```

#### getReplayData(): SignatureReplay | null
获取当前签名的回放数据

```typescript
const exportReplayData = () => {
  const replayData = signatureRef.value?.getReplayData()
  if (replayData) {
    console.log('回放数据:', replayData)
    // 可以保存到本地存储或发送到服务器
    localStorage.setItem('signature-replay', JSON.stringify(replayData))
  }
}
```

#### setReplayMode(enabled: boolean)
设置回放模式开关

```typescript
const toggleReplayMode = () => {
  const isReplayMode = !replayMode.value
  replayMode.value = isReplayMode
  signatureRef.value?.setReplayMode(isReplayMode)
}
```

#### play()
播放回放

```typescript
const playReplay = () => {
  signatureRef.value?.play()
}
```

#### pause()
暂停回放

```typescript
const pauseReplay = () => {
  signatureRef.value?.pause()
}
```

#### stop()
停止回放

```typescript
const stopReplay = () => {
  signatureRef.value?.stop()
}
```

#### seek(time: number)
跳转到指定时间

**参数**:
- `time`: 目标时间（毫秒）

```typescript
const seekToMiddle = () => {
  const totalDuration = signatureRef.value?.getTotalDuration() || 0
  signatureRef.value?.seek(totalDuration / 2)
}
```

#### setSpeed(speed: number)
设置回放速度

**参数**:
- `speed`: 速度倍率（0.1-5.0）

```typescript
const changeSpeed = (speed: number) => {
  signatureRef.value?.setSpeed(speed)
}
```

#### getState(): ReplayState
获取当前回放状态

**返回值**: `'idle' | 'playing' | 'paused' | 'stopped' | 'completed'`

```typescript
const checkReplayState = () => {
  const state = signatureRef.value?.getState()
  console.log('当前回放状态:', state)
}
```

#### getCurrentTime(): number
获取当前回放时间（毫秒）

```typescript
const showCurrentTime = () => {
  const currentTime = signatureRef.value?.getCurrentTime() || 0
  console.log('当前时间:', currentTime, 'ms')
}
```

#### getTotalDuration(): number
获取总回放时长（毫秒）

```typescript
const showTotalDuration = () => {
  const totalDuration = signatureRef.value?.getTotalDuration() || 0
  console.log('总时长:', totalDuration, 'ms')
}
```

#### getProgress(): number
获取回放进度（0-1）

```typescript
const showProgress = () => {
  const progress = signatureRef.value?.getProgress() || 0
  console.log('回放进度:', Math.round(progress * 100), '%')
}
```

### 回放事件

#### replay-start
回放开始时触发

```vue
<ElectronicSignature @replay-start="onReplayStart" />
```

```typescript
const onReplayStart = () => {
  console.log('回放开始')
}
```

#### replay-progress
回放进度更新时触发

**参数**:
- `progress`: 进度值（0-1）
- `currentTime`: 当前时间（毫秒）

```vue
<ElectronicSignature @replay-progress="onReplayProgress" />
```

```typescript
const onReplayProgress = (progress: number, currentTime: number) => {
  console.log(`回放进度: ${Math.round(progress * 100)}%`)
  console.log(`当前时间: ${currentTime}ms`)
}
```

#### replay-pause
回放暂停时触发

```vue
<ElectronicSignature @replay-pause="onReplayPause" />
```

#### replay-resume
回放恢复时触发

```vue
<ElectronicSignature @replay-resume="onReplayResume" />
```

#### replay-stop
回放停止时触发

```vue
<ElectronicSignature @replay-stop="onReplayStop" />
```

#### replay-complete
回放完成时触发

```vue
<ElectronicSignature @replay-complete="onReplayComplete" />
```

```typescript
const onReplayComplete = () => {
  console.log('回放完成')
  // 可以在这里执行回放完成后的逻辑
}
```

#### replay-path-start
开始绘制笔画时触发

**参数**:
- `pathIndex`: 笔画索引
- `path`: 笔画数据

```vue
<ElectronicSignature @replay-path-start="onReplayPathStart" />
```

```typescript
const onReplayPathStart = (pathIndex: number, path: SignaturePath) => {
  console.log(`开始绘制第 ${pathIndex + 1} 笔画`)
}
```

#### replay-path-end
完成绘制笔画时触发

**参数**:
- `pathIndex`: 笔画索引
- `path`: 笔画数据

```vue
<ElectronicSignature @replay-path-end="onReplayPathEnd" />
```

#### replay-speed-change
回放速度改变时触发

**参数**:
- `speed`: 新的速度倍率

```vue
<ElectronicSignature @replay-speed-change="onReplaySpeedChange" />
```

```typescript
const onReplaySpeedChange = (speed: number) => {
  console.log('回放速度改变为:', speed, 'x')
}
```

## 类型定义

### SignatureReplay
回放数据接口

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
回放选项接口

```typescript
interface ReplayOptions {
  speed?: number                             // 回放速度倍率（0.1-5.0）
  loop?: boolean                             // 是否循环播放
  showControls?: boolean                     // 是否显示内置控制条
  autoPlay?: boolean                         // 是否自动开始播放
  startTime?: number                         // 回放开始时间（毫秒）
  endTime?: number                           // 回放结束时间（毫秒）
}
```

### ReplayState
回放状态类型

```typescript
type ReplayState = 'idle' | 'playing' | 'paused' | 'stopped' | 'completed'
```

## 完整示例

### 基础回放示例

```vue
<template>
  <div>
    <!-- 录制区域 -->
    <ElectronicSignature
      ref="recordingRef"
      :width="400"
      :height="200"
      @signature-end="onSignatureEnd"
    />

    <!-- 回放区域 -->
    <ElectronicSignature
      ref="replayRef"
      :width="400"
      :height="200"
      :replay-mode="true"
      :replay-data="replayData"
      :replay-options="replayOptions"
      @replay-complete="onReplayComplete"
    />

    <!-- 控制按钮 -->
    <div>
      <button @click="startReplay">开始回放</button>
      <button @click="pauseReplay">暂停</button>
      <button @click="stopReplay">停止</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import type {
  SignatureMethods,
  SignatureData,
  SignatureReplay
} from 'vue3-electronic-signature'

const recordingRef = ref<SignatureMethods>()
const replayRef = ref<SignatureMethods>()
const replayData = ref<SignatureReplay | null>(null)

const replayOptions = reactive({
  speed: 1,
  loop: false,
  showControls: true,
  autoPlay: false
})

const onSignatureEnd = (data: SignatureData) => {
  // 生成回放数据
  replayData.value = recordingRef.value?.getReplayData() || null
}

const startReplay = () => {
  if (replayData.value) {
    replayRef.value?.startReplay(replayData.value, replayOptions)
  }
}

const pauseReplay = () => {
  replayRef.value?.pause()
}

const stopReplay = () => {
  replayRef.value?.stop()
}

const onReplayComplete = () => {
  console.log('回放完成')
}
</script>
```
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

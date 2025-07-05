# 📚 API参考文档

> 雅致PDF预览器完整API文档

## 🏗️ 核心类

### PDFViewer

PDF查看器的核心类，提供完整的PDF预览功能。

#### 构造函数

```typescript
constructor(options: PDFViewerOptions)
```

**参数:**
- `options`: 查看器配置选项

**示例:**
```javascript
const viewer = new PDFViewer({
  container: document.getElementById('pdf-container'),
  viewport: {
    width: 800,
    height: 600,
    initialScale: 1.0,
  },
});
```

#### 方法

##### loadDocument(dataSource)

加载PDF文档。

```typescript
async loadDocument(dataSource: PDFDataSource): Promise<void>
```

**参数:**
- `dataSource`: PDF数据源，支持URL字符串、ArrayBuffer或Uint8Array

**示例:**
```javascript
// 从URL加载
await viewer.loadDocument('https://example.com/document.pdf');

// 从文件加载
const file = document.getElementById('fileInput').files[0];
await viewer.loadDocument(file);

// 从ArrayBuffer加载
const buffer = new ArrayBuffer(/* PDF数据 */);
await viewer.loadDocument(buffer);
```

##### goToPage(pageNumber)

跳转到指定页面。

```typescript
async goToPage(pageNumber: number): Promise<void>
```

**参数:**
- `pageNumber`: 页面编号（从1开始）

##### nextPage()

跳转到下一页。

```typescript
async nextPage(): Promise<void>
```

##### previousPage()

跳转到上一页。

```typescript
async previousPage(): Promise<void>
```

##### setScale(scale, center?)

设置缩放比例。

```typescript
setScale(scale: number, center?: Point): void
```

**参数:**
- `scale`: 缩放比例
- `center`: 缩放中心点（可选）

##### zoomIn(factor?)

放大视图。

```typescript
zoomIn(factor?: number): void
```

**参数:**
- `factor`: 放大倍数，默认1.2

##### zoomOut(factor?)

缩小视图。

```typescript
zoomOut(factor?: number): void
```

**参数:**
- `factor`: 缩小倍数，默认0.8

##### fitWidth()

适应页面宽度。

```typescript
fitWidth(): void
```

##### fitHeight()

适应页面高度。

```typescript
fitHeight(): void
```

##### addEventListener(eventType, listener)

添加事件监听器。

```typescript
addEventListener<T extends EventData>(
  eventType: EventType,
  listener: EventListener<T>
): void
```

##### removeEventListener(eventType, listener)

移除事件监听器。

```typescript
removeEventListener<T extends EventData>(
  eventType: EventType,
  listener: EventListener<T>
): void
```

##### getDocumentInfo()

获取文档信息。

```typescript
getDocumentInfo(): PDFDocumentInfo
```

##### getCurrentPage()

获取当前页面编号。

```typescript
getCurrentPage(): number
```

##### getPageCount()

获取总页数。

```typescript
getPageCount(): number
```

##### getScale()

获取当前缩放比例。

```typescript
getScale(): number
```

##### getStats()

获取统计信息。

```typescript
getStats(): {
  cache: CacheStats;
  render: RenderStats;
  events: EventStats;
}
```

##### destroy()

销毁查看器，释放资源。

```typescript
destroy(): void
```

## 🎨 组件API

### Vue3组件

#### 属性 (Props)

| 属性名 | 类型 | 默认值 | 描述 |
|--------|------|--------|------|
| `src` | `PDFDataSource` | - | PDF文件源 |
| `width` | `number \| string` | `'100%'` | 组件宽度 |
| `height` | `number \| string` | `'600px'` | 组件高度 |
| `initialScale` | `number` | `1.0` | 初始缩放比例 |
| `minScale` | `number` | `0.1` | 最小缩放比例 |
| `maxScale` | `number` | `5.0` | 最大缩放比例 |
| `showToolbar` | `boolean` | `true` | 是否显示工具栏 |
| `showStatusBar` | `boolean` | `true` | 是否显示状态栏 |
| `backgroundColor` | `string` | `'#ffffff'` | 背景颜色 |
| `quality` | `number` | `3` | 渲染质量(1-5) |
| `enableTextSelection` | `boolean` | `true` | 是否启用文本选择 |
| `enableAnnotations` | `boolean` | `true` | 是否启用注释 |
| `loadingText` | `string` | `'正在加载PDF文档...'` | 加载提示文本 |

#### 事件 (Events)

| 事件名 | 参数类型 | 描述 |
|--------|----------|------|
| `documentLoaded` | `PDFDocumentInfo` | 文档加载完成 |
| `pageChanged` | `number` | 页面变化 |
| `scaleChanged` | `number` | 缩放变化 |
| `rendered` | `number` | 页面渲染完成 |
| `error` | `Error` | 错误发生 |

#### 方法 (Methods)

通过模板引用访问组件方法：

```vue
<template>
  <ElegantPDFViewer ref="pdfViewer" :src="pdfUrl" />
</template>

<script setup>
import { ref } from 'vue';

const pdfViewer = ref(null);

// 调用组件方法
const goToFirstPage = () => {
  pdfViewer.value?.goToPage(1);
};
</script>
```

可用方法：
- `previousPage(): Promise<void>`
- `nextPage(): Promise<void>`
- `goToPage(pageNumber: number): Promise<void>`
- `zoomIn(): void`
- `zoomOut(): void`
- `setScale(scale: number): void`
- `fitWidth(): void`
- `fitHeight(): void`
- `retry(): void`
- `getStats(): any`
- `getCurrentPage(): number`
- `getPageCount(): number`
- `getScale(): number`

### React组件

#### 属性 (Props)

React组件的属性与Vue3组件基本相同，但使用驼峰命名：

```typescript
interface ElegantPDFViewerProps {
  src?: PDFDataSource;
  width?: number | string;
  height?: number | string;
  initialScale?: number;
  minScale?: number;
  maxScale?: number;
  showToolbar?: boolean;
  showStatusBar?: boolean;
  backgroundColor?: string;
  quality?: number;
  enableTextSelection?: boolean;
  enableAnnotations?: boolean;
  loadingText?: string;
  
  // 事件回调
  onDocumentLoaded?: (info: PDFDocumentInfo) => void;
  onPageChanged?: (pageNumber: number) => void;
  onScaleChanged?: (scale: number) => void;
  onRendered?: (pageNumber: number) => void;
  onError?: (error: Error) => void;
}
```

#### Ref方法

通过forwardRef访问组件方法：

```jsx
import { useRef } from 'react';
import { ElegantPDFViewer } from '@elegant-pdf/react';

function App() {
  const pdfViewerRef = useRef(null);
  
  const goToFirstPage = () => {
    pdfViewerRef.current?.goToPage(1);
  };
  
  return (
    <ElegantPDFViewer
      ref={pdfViewerRef}
      src="document.pdf"
    />
  );
}
```

## 🔧 配置选项

### PDFViewerOptions

```typescript
interface PDFViewerOptions {
  container: HTMLElement;
  viewport?: ViewportConfig;
  renderOptions?: RenderOptions;
  cache?: CacheConfig;
  debugMode?: boolean;
}
```

### ViewportConfig

```typescript
interface ViewportConfig {
  width: number;
  height: number;
  initialScale?: number;
  minScale?: number;
  maxScale?: number;
  fitWidth?: boolean;
  fitHeight?: boolean;
}
```

### RenderOptions

```typescript
interface RenderOptions {
  scale?: number;
  rotation?: number;
  backgroundColor?: string;
  enableTextSelection?: boolean;
  enableAnnotations?: boolean;
  quality?: number; // 1-5
}
```

### CacheConfig

```typescript
interface CacheConfig {
  maxPages?: number;
  maxMemory?: number; // 字节
  expireTime?: number; // 毫秒
  cleanupInterval?: number; // 毫秒
}
```

## 📡 事件系统

### EventType枚举

```typescript
enum EventType {
  DOCUMENT_LOADED = 'documentLoaded',
  PAGE_CHANGED = 'pageChanged',
  SCALE_CHANGED = 'scaleChanged',
  VIEWPORT_CHANGED = 'viewportChanged',
  PAGE_RENDERED = 'pageRendered',
  ERROR = 'error',
}
```

### 事件数据类型

#### DocumentLoadedEvent

```typescript
interface DocumentLoadedEvent {
  type: EventType.DOCUMENT_LOADED;
  timestamp: number;
  documentInfo: PDFDocumentInfo;
}
```

#### PageChangedEvent

```typescript
interface PageChangedEvent {
  type: EventType.PAGE_CHANGED;
  timestamp: number;
  pageNumber: number;
}
```

#### ScaleChangedEvent

```typescript
interface ScaleChangedEvent {
  type: EventType.SCALE_CHANGED;
  timestamp: number;
  scale: number;
}
```

#### ErrorEvent

```typescript
interface ErrorEvent {
  type: EventType.ERROR;
  timestamp: number;
  error: Error;
  context?: string;
}
```

## 🔍 数据类型

### PDFDocumentInfo

```typescript
interface PDFDocumentInfo {
  title?: string;
  author?: string;
  subject?: string;
  creator?: string;
  producer?: string;
  creationDate?: Date;
  modificationDate?: Date;
  pageCount: number;
  version: string;
}
```

### PDFPageInfo

```typescript
interface PDFPageInfo {
  pageNumber: number;
  size: Rectangle;
  rotation: number;
  contentStream?: PDFObject;
  resources?: PDFObject;
}
```

### Rectangle

```typescript
interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}
```

### Point

```typescript
interface Point {
  x: number;
  y: number;
}
```

## 🚨 错误类型

### ErrorType枚举

```typescript
enum ErrorType {
  INVALID_FORMAT = 'INVALID_FORMAT',
  CORRUPTED_FILE = 'CORRUPTED_FILE',
  NETWORK_ERROR = 'NETWORK_ERROR',
  RENDER_ERROR = 'RENDER_ERROR',
  OUT_OF_MEMORY = 'OUT_OF_MEMORY',
  UNSUPPORTED_FEATURE = 'UNSUPPORTED_FEATURE',
}
```

### PDFError

```typescript
interface PDFError extends Error {
  type: ErrorType;
  context?: any;
}
```

## 🎯 使用示例

### 完整的错误处理

```javascript
try {
  await viewer.loadDocument(pdfSource);
} catch (error) {
  switch (error.type) {
    case ErrorType.NETWORK_ERROR:
      console.error('网络错误:', error.message);
      break;
    case ErrorType.INVALID_FORMAT:
      console.error('文件格式错误:', error.message);
      break;
    case ErrorType.CORRUPTED_FILE:
      console.error('文件损坏:', error.message);
      break;
    default:
      console.error('未知错误:', error.message);
  }
}
```

### 性能监控

```javascript
viewer.addEventListener('pageRendered', (event) => {
  const stats = viewer.getStats();
  console.log('渲染统计:', {
    renderTime: stats.render.renderTime,
    cacheHitRate: stats.cache.hitRate,
    memoryUsage: stats.cache.totalMemory,
  });
});
```

### 自定义缓存策略

```javascript
const viewer = new PDFViewer({
  container: element,
  cache: {
    maxPages: 15,
    maxMemory: 100 * 1024 * 1024, // 100MB
    expireTime: 10 * 60 * 1000, // 10分钟
    cleanupInterval: 60 * 1000, // 1分钟
  },
});
```

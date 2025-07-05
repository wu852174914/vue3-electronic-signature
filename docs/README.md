# 🎨 雅致PDF预览器 - 完整文档

> 纯手工打造的跨框架PDF预览库 - 优雅、高性能、零依赖

## 📚 文档目录

- [快速开始](./quick-start.md) - 5分钟上手指南
- [API参考](./api-reference.md) - 完整的API文档
- [框架集成](./framework-integration.md) - 各框架的集成指南
- [配置选项](./configuration.md) - 详细的配置说明
- [事件系统](./events.md) - 事件监听和处理
- [性能优化](./performance.md) - 性能优化指南
- [故障排除](./troubleshooting.md) - 常见问题解决
- [开发指南](./development.md) - 开发和贡献指南

## 🚀 核心特性

### ✨ 技术特色

- **🔧 纯手工打造** - 不依赖任何第三方PDF预览插件，完全自主实现
- **🎯 跨框架支持** - 完美支持Vue2、Vue3、React三大主流框架
- **📊 双重数据源** - 支持URL链接和二进制数据流两种加载方式
- **⚡ 性能卓越** - 零内存泄漏，流畅的用户体验
- **🎨 代码雅致** - 整洁的架构设计，详尽的中文注释

### 🏗️ 架构设计

```
雅致PDF预览器
├── 📦 @elegant-pdf/core      # 核心引擎
│   ├── 🔍 PDF解析器          # PDF文档结构解析
│   ├── 🎨 Canvas渲染器       # 高性能页面渲染
│   ├── 📐 视口管理器         # 缩放、平移、适应
│   ├── 📡 事件管理器         # 发布订阅事件系统
│   └── 💾 资源管理器         # 智能缓存和内存管理
├── 🟢 @elegant-pdf/vue3      # Vue3适配器
├── 🟢 @elegant-pdf/vue2      # Vue2适配器
└── ⚛️ @elegant-pdf/react     # React适配器
```

## 📦 安装

### NPM安装

```bash
# 核心库（必需）
npm install @elegant-pdf/core

# 根据你的框架选择对应的适配器
npm install @elegant-pdf/vue3   # Vue3项目
npm install @elegant-pdf/vue2   # Vue2项目
npm install @elegant-pdf/react  # React项目
```

### CDN引入

```html
<!-- 核心库 -->
<script src="https://unpkg.com/@elegant-pdf/core@latest/dist/index.umd.js"></script>

<!-- Vue3适配器 -->
<script src="https://unpkg.com/@elegant-pdf/vue3@latest/dist/index.umd.js"></script>
```

## 🎯 快速开始

### Vue3示例

```vue
<template>
  <ElegantPDFViewer
    :src="pdfUrl"
    :width="800"
    :height="600"
    @document-loaded="onDocumentLoaded"
    @page-changed="onPageChanged"
  />
</template>

<script setup>
import { ElegantPDFViewer } from '@elegant-pdf/vue3';

const pdfUrl = 'https://example.com/document.pdf';

const onDocumentLoaded = (info) => {
  console.log('文档加载完成:', info);
};

const onPageChanged = (pageNumber) => {
  console.log('当前页面:', pageNumber);
};
</script>
```

### React示例

```jsx
import React from 'react';
import { ElegantPDFViewer } from '@elegant-pdf/react';

function App() {
  const handleDocumentLoaded = (info) => {
    console.log('文档加载完成:', info);
  };

  return (
    <ElegantPDFViewer
      src="https://example.com/document.pdf"
      width={800}
      height={600}
      onDocumentLoaded={handleDocumentLoaded}
    />
  );
}

export default App;
```

### Vue2示例

```vue
<template>
  <ElegantPDFViewer
    :src="pdfUrl"
    :width="800"
    :height="600"
    @document-loaded="onDocumentLoaded"
  />
</template>

<script>
import { ElegantPDFViewer } from '@elegant-pdf/vue2';

export default {
  components: {
    ElegantPDFViewer,
  },
  data() {
    return {
      pdfUrl: 'https://example.com/document.pdf',
    };
  },
  methods: {
    onDocumentLoaded(info) {
      console.log('文档加载完成:', info);
    },
  },
};
</script>
```

## 🔧 核心API

### PDFViewer类

```typescript
import { PDFViewer } from '@elegant-pdf/core';

// 创建查看器实例
const viewer = new PDFViewer({
  container: document.getElementById('pdf-container'),
  viewport: {
    width: 800,
    height: 600,
    initialScale: 1.0,
  },
});

// 加载PDF文档
await viewer.loadDocument('path/to/document.pdf');

// 页面导航
viewer.goToPage(1);
viewer.nextPage();
viewer.previousPage();

// 缩放控制
viewer.setScale(1.5);
viewer.zoomIn();
viewer.zoomOut();
viewer.fitWidth();
viewer.fitHeight();
```

### 组件属性

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `src` | `string \| ArrayBuffer \| Uint8Array` | - | PDF文件源 |
| `width` | `number \| string` | `'100%'` | 组件宽度 |
| `height` | `number \| string` | `'600px'` | 组件高度 |
| `initialScale` | `number` | `1.0` | 初始缩放比例 |
| `showToolbar` | `boolean` | `true` | 是否显示工具栏 |
| `showStatusBar` | `boolean` | `true` | 是否显示状态栏 |
| `backgroundColor` | `string` | `'#ffffff'` | 背景颜色 |
| `quality` | `number` | `3` | 渲染质量(1-5) |

### 事件回调

| 事件 | 参数 | 描述 |
|------|------|------|
| `documentLoaded` | `PDFDocumentInfo` | 文档加载完成 |
| `pageChanged` | `number` | 页面变化 |
| `scaleChanged` | `number` | 缩放变化 |
| `rendered` | `number` | 页面渲染完成 |
| `error` | `Error` | 错误发生 |

## 🎨 高级功能

### 自定义渲染选项

```javascript
const viewer = new PDFViewer({
  container: element,
  renderOptions: {
    scale: 1.5,
    rotation: 90,
    backgroundColor: '#f0f0f0',
    enableTextSelection: true,
    enableAnnotations: true,
    quality: 4,
  },
});
```

### 缓存配置

```javascript
const viewer = new PDFViewer({
  container: element,
  cache: {
    maxPages: 20,
    maxMemory: 200 * 1024 * 1024, // 200MB
  },
});
```

### 事件监听

```javascript
viewer.addEventListener('documentLoaded', (info) => {
  console.log(`文档标题: ${info.title}`);
  console.log(`页面数量: ${info.pageCount}`);
});

viewer.addEventListener('pageChanged', (pageNumber) => {
  console.log(`当前页面: ${pageNumber}`);
});

viewer.addEventListener('error', (error) => {
  console.error('PDF错误:', error);
});
```

## 🌟 最佳实践

### 1. 性能优化

```javascript
// 合理设置缓存大小
const viewer = new PDFViewer({
  cache: {
    maxPages: Math.min(10, totalPages),
    maxMemory: 50 * 1024 * 1024,
  },
});

// 使用适当的渲染质量
const quality = window.devicePixelRatio > 1 ? 4 : 3;
```

### 2. 错误处理

```javascript
try {
  await viewer.loadDocument(pdfSource);
} catch (error) {
  if (error.type === 'NETWORK_ERROR') {
    // 处理网络错误
  } else if (error.type === 'INVALID_FORMAT') {
    // 处理格式错误
  }
}
```

### 3. 响应式设计

```javascript
// 监听窗口大小变化
window.addEventListener('resize', () => {
  viewer.fitWidth();
});

// 移动端优化
const isMobile = window.innerWidth < 768;
const initialScale = isMobile ? 0.8 : 1.0;
```

## 📱 浏览器兼容性

| 浏览器 | 版本要求 | 支持状态 |
|--------|----------|----------|
| Chrome | ≥ 60 | ✅ 完全支持 |
| Firefox | ≥ 55 | ✅ 完全支持 |
| Safari | ≥ 12 | ✅ 完全支持 |
| Edge | ≥ 79 | ✅ 完全支持 |
| IE | - | ❌ 不支持 |

## 📄 许可证

本项目采用 [MIT 许可证](../LICENSE)。

## 🤝 贡献

欢迎贡献代码！请查看 [贡献指南](./development.md) 了解详细信息。

## 📞 支持

- 📧 邮箱: support@elegant-pdf.com
- 🐛 问题反馈: [GitHub Issues](https://github.com/elegant-pdf/pdf-viewer/issues)
- 💬 讨论: [GitHub Discussions](https://github.com/elegant-pdf/pdf-viewer/discussions)

---

<div align="center">
  <p>用 ❤️ 和 ☕ 精心打造</p>
  <p>© 2024 雅致PDF团队</p>
</div>

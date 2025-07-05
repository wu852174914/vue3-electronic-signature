# 🚀 快速开始指南

> 5分钟上手雅致PDF预览器

## 📋 前置要求

- Node.js >= 14.0.0
- 现代浏览器（Chrome 60+, Firefox 55+, Safari 12+, Edge 79+）
- 基础的前端开发知识

## 🎯 选择适合的包

根据你的项目框架选择对应的包：

| 框架 | 包名 | 版本要求 |
|------|------|----------|
| Vue 3 | `@elegant-pdf/vue3` | Vue 3.0+ |
| Vue 2 | `@elegant-pdf/vue2` | Vue 2.6+ |
| React | `@elegant-pdf/react` | React 16.8+ |
| 原生JS | `@elegant-pdf/core` | ES2015+ |

## 📦 安装

### 使用npm

```bash
# Vue3项目
npm install @elegant-pdf/core @elegant-pdf/vue3

# Vue2项目
npm install @elegant-pdf/core @elegant-pdf/vue2

# React项目
npm install @elegant-pdf/core @elegant-pdf/react

# 原生JavaScript项目
npm install @elegant-pdf/core
```

### 使用yarn

```bash
# Vue3项目
yarn add @elegant-pdf/core @elegant-pdf/vue3

# Vue2项目
yarn add @elegant-pdf/core @elegant-pdf/vue2

# React项目
yarn add @elegant-pdf/core @elegant-pdf/react
```

### 使用CDN

```html
<!-- 核心库 -->
<script src="https://unpkg.com/@elegant-pdf/core@latest/dist/index.umd.js"></script>

<!-- Vue3适配器 -->
<script src="https://unpkg.com/@elegant-pdf/vue3@latest/dist/index.umd.js"></script>
```

## 🎨 基础使用

### Vue 3 示例

#### 1. 单文件组件方式

```vue
<template>
  <div class="pdf-container">
    <h1>我的PDF查看器</h1>
    
    <!-- PDF查看器组件 -->
    <ElegantPDFViewer
      :src="pdfUrl"
      :width="800"
      :height="600"
      :show-toolbar="true"
      :show-status-bar="true"
      @document-loaded="handleDocumentLoaded"
      @page-changed="handlePageChanged"
      @error="handleError"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { ElegantPDFViewer } from '@elegant-pdf/vue3';

// PDF文件URL
const pdfUrl = ref('https://example.com/sample.pdf');

// 事件处理函数
const handleDocumentLoaded = (info) => {
  console.log('文档加载完成:', info);
  console.log(`标题: ${info.title}`);
  console.log(`页数: ${info.pageCount}`);
};

const handlePageChanged = (pageNumber) => {
  console.log(`当前页面: ${pageNumber}`);
};

const handleError = (error) => {
  console.error('PDF加载错误:', error);
  alert(`加载失败: ${error.message}`);
};
</script>

<style scoped>
.pdf-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  text-align: center;
  color: #333;
  margin-bottom: 20px;
}
</style>
```

#### 2. 组合式API高级用法

```vue
<template>
  <div class="advanced-pdf-viewer">
    <!-- 自定义工具栏 -->
    <div class="custom-toolbar">
      <button @click="loadSamplePDF">加载示例PDF</button>
      <button @click="previousPage" :disabled="!canGoPrevious">上一页</button>
      <span>{{ currentPage }} / {{ pageCount }}</span>
      <button @click="nextPage" :disabled="!canGoNext">下一页</button>
      <button @click="zoomIn">放大</button>
      <button @click="zoomOut">缩小</button>
      <span>{{ Math.round(scale * 100) }}%</span>
    </div>
    
    <!-- PDF查看器 -->
    <ElegantPDFViewer
      ref="pdfViewerRef"
      :src="pdfSrc"
      :width="'100%'"
      :height="600"
      :show-toolbar="false"
      @document-loaded="onDocumentLoaded"
      @page-changed="onPageChanged"
      @scale-changed="onScaleChanged"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { ElegantPDFViewer } from '@elegant-pdf/vue3';

// 响应式数据
const pdfViewerRef = ref(null);
const pdfSrc = ref(null);
const currentPage = ref(1);
const pageCount = ref(0);
const scale = ref(1.0);

// 计算属性
const canGoPrevious = computed(() => currentPage.value > 1);
const canGoNext = computed(() => currentPage.value < pageCount.value);

// 方法
const loadSamplePDF = () => {
  pdfSrc.value = 'https://example.com/sample.pdf';
};

const previousPage = () => {
  pdfViewerRef.value?.previousPage();
};

const nextPage = () => {
  pdfViewerRef.value?.nextPage();
};

const zoomIn = () => {
  pdfViewerRef.value?.zoomIn();
};

const zoomOut = () => {
  pdfViewerRef.value?.zoomOut();
};

// 事件处理
const onDocumentLoaded = (info) => {
  pageCount.value = info.pageCount;
  currentPage.value = 1;
};

const onPageChanged = (page) => {
  currentPage.value = page;
};

const onScaleChanged = (newScale) => {
  scale.value = newScale;
};
</script>
```

### React 示例

#### 1. 函数组件方式

```jsx
import React, { useState, useRef } from 'react';
import { ElegantPDFViewer } from '@elegant-pdf/react';

function PDFViewerApp() {
  const [pdfUrl] = useState('https://example.com/sample.pdf');
  const [documentInfo, setDocumentInfo] = useState(null);
  const viewerRef = useRef(null);

  const handleDocumentLoaded = (info) => {
    setDocumentInfo(info);
    console.log('文档加载完成:', info);
  };

  const handlePageChanged = (pageNumber) => {
    console.log('当前页面:', pageNumber);
  };

  const handleError = (error) => {
    console.error('PDF错误:', error);
    alert(`加载失败: ${error.message}`);
  };

  const goToFirstPage = () => {
    viewerRef.current?.goToPage(1);
  };

  const fitWidth = () => {
    viewerRef.current?.fitWidth();
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>React PDF查看器</h1>
      
      {/* 自定义控制按钮 */}
      <div style={{ marginBottom: '20px' }}>
        <button onClick={goToFirstPage}>回到首页</button>
        <button onClick={fitWidth}>适应宽度</button>
        {documentInfo && (
          <span style={{ marginLeft: '20px' }}>
            文档: {documentInfo.title} ({documentInfo.pageCount} 页)
          </span>
        )}
      </div>
      
      {/* PDF查看器 */}
      <ElegantPDFViewer
        ref={viewerRef}
        src={pdfUrl}
        width={800}
        height={600}
        showToolbar={true}
        showStatusBar={true}
        onDocumentLoaded={handleDocumentLoaded}
        onPageChanged={handlePageChanged}
        onError={handleError}
      />
    </div>
  );
}

export default PDFViewerApp;
```

#### 2. 使用自定义Hook

```jsx
import React from 'react';
import { usePDFViewer } from '@elegant-pdf/react';

function AdvancedPDFViewer() {
  const [state, actions] = usePDFViewer('https://example.com/sample.pdf');

  const {
    loading,
    error,
    currentPage,
    pageCount,
    scale,
    documentInfo,
  } = state;

  const {
    previousPage,
    nextPage,
    zoomIn,
    zoomOut,
    fitWidth,
    fitHeight,
  } = actions;

  if (loading) {
    return <div>正在加载PDF...</div>;
  }

  if (error) {
    return <div>加载错误: {error}</div>;
  }

  return (
    <div>
      <div className="controls">
        <button onClick={previousPage} disabled={currentPage <= 1}>
          上一页
        </button>
        <span>{currentPage} / {pageCount}</span>
        <button onClick={nextPage} disabled={currentPage >= pageCount}>
          下一页
        </button>
        <button onClick={zoomIn}>放大</button>
        <button onClick={zoomOut}>缩小</button>
        <span>{Math.round(scale * 100)}%</span>
        <button onClick={fitWidth}>适应宽度</button>
        <button onClick={fitHeight}>适应高度</button>
      </div>
      
      {documentInfo && (
        <div className="info">
          <h3>{documentInfo.title}</h3>
          <p>作者: {documentInfo.author}</p>
          <p>页数: {documentInfo.pageCount}</p>
        </div>
      )}
    </div>
  );
}
```

### Vue 2 示例

```vue
<template>
  <div class="pdf-app">
    <h1>Vue2 PDF查看器</h1>
    
    <!-- 文件选择 -->
    <div class="file-selector">
      <input
        type="file"
        accept=".pdf"
        @change="handleFileSelect"
        ref="fileInput"
      />
      <button @click="loadSamplePDF">加载示例PDF</button>
    </div>
    
    <!-- PDF查看器 -->
    <ElegantPDFViewer
      :src="pdfSrc"
      :width="800"
      :height="600"
      :initial-scale="1.0"
      :show-toolbar="true"
      :show-status-bar="true"
      @document-loaded="onDocumentLoaded"
      @page-changed="onPageChanged"
      @error="onError"
    />
    
    <!-- 文档信息 -->
    <div v-if="documentInfo" class="document-info">
      <h3>文档信息</h3>
      <p><strong>标题:</strong> {{ documentInfo.title }}</p>
      <p><strong>作者:</strong> {{ documentInfo.author }}</p>
      <p><strong>页数:</strong> {{ documentInfo.pageCount }}</p>
    </div>
  </div>
</template>

<script>
import { ElegantPDFViewer } from '@elegant-pdf/vue2';

export default {
  name: 'PDFApp',
  components: {
    ElegantPDFViewer,
  },
  data() {
    return {
      pdfSrc: null,
      documentInfo: null,
    };
  },
  methods: {
    handleFileSelect(event) {
      const file = event.target.files[0];
      if (file && file.type === 'application/pdf') {
        this.pdfSrc = file;
      } else {
        alert('请选择PDF文件');
      }
    },
    
    loadSamplePDF() {
      this.pdfSrc = 'https://example.com/sample.pdf';
    },
    
    onDocumentLoaded(info) {
      this.documentInfo = info;
      console.log('文档加载完成:', info);
    },
    
    onPageChanged(pageNumber) {
      console.log('当前页面:', pageNumber);
    },
    
    onError(error) {
      console.error('PDF错误:', error);
      alert(`加载失败: ${error.message}`);
    },
  },
};
</script>

<style scoped>
.pdf-app {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.file-selector {
  margin-bottom: 20px;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 5px;
  background: #f9f9f9;
}

.file-selector input {
  margin-right: 10px;
}

.document-info {
  margin-top: 20px;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 5px;
  background: #f0f8ff;
}
</style>
```

## 🔧 原生JavaScript使用

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>原生JS PDF查看器</title>
</head>
<body>
    <div id="pdf-container" style="width: 800px; height: 600px;"></div>
    
    <script src="https://unpkg.com/@elegant-pdf/core@latest/dist/index.umd.js"></script>
    <script>
        // 创建PDF查看器
        const viewer = new ElegantPDF.PDFViewer({
            container: document.getElementById('pdf-container'),
            viewport: {
                width: 800,
                height: 600,
                initialScale: 1.0,
            },
        });
        
        // 加载PDF文档
        viewer.loadDocument('https://example.com/sample.pdf')
            .then(() => {
                console.log('PDF加载成功');
            })
            .catch(error => {
                console.error('PDF加载失败:', error);
            });
        
        // 监听事件
        viewer.addEventListener('documentLoaded', (info) => {
            console.log('文档信息:', info);
        });
        
        viewer.addEventListener('pageChanged', (pageNumber) => {
            console.log('当前页面:', pageNumber);
        });
    </script>
</body>
</html>
```

## 🎯 下一步

现在你已经成功集成了雅致PDF预览器！接下来可以：

1. 📖 查看 [API参考文档](./api-reference.md) 了解更多功能
2. ⚙️ 阅读 [配置选项](./configuration.md) 自定义查看器
3. 🎨 学习 [事件系统](./events.md) 实现交互功能
4. 🚀 参考 [性能优化](./performance.md) 提升用户体验

## ❓ 遇到问题？

- 查看 [故障排除指南](./troubleshooting.md)
- 提交 [GitHub Issue](https://github.com/elegant-pdf/pdf-viewer/issues)
- 加入 [讨论社区](https://github.com/elegant-pdf/pdf-viewer/discussions)

# ⚙️ 配置选项详解

> 雅致PDF预览器的完整配置指南

## 📋 目录

- [核心配置](#核心配置)
- [视口配置](#视口配置)
- [渲染配置](#渲染配置)
- [缓存配置](#缓存配置)
- [组件配置](#组件配置)
- [性能调优](#性能调优)
- [最佳实践](#最佳实践)

## 🏗️ 核心配置

### PDFViewerOptions

PDF查看器的主要配置选项。

```typescript
interface PDFViewerOptions {
  /** 容器元素（必需） */
  container: HTMLElement;
  
  /** 视口配置 */
  viewport?: ViewportConfig;
  
  /** 渲染配置 */
  renderOptions?: RenderOptions;
  
  /** 缓存配置 */
  cache?: CacheConfig;
  
  /** 是否启用调试模式 */
  debugMode?: boolean;
}
```

**示例:**
```javascript
const viewer = new PDFViewer({
  container: document.getElementById('pdf-container'),
  viewport: {
    width: 800,
    height: 600,
    initialScale: 1.2,
  },
  renderOptions: {
    quality: 4,
    backgroundColor: '#f5f5f5',
  },
  cache: {
    maxPages: 15,
    maxMemory: 100 * 1024 * 1024,
  },
  debugMode: false,
});
```

## 📐 视口配置

### ViewportConfig

控制PDF查看器的视口行为。

```typescript
interface ViewportConfig {
  /** 视口宽度（必需） */
  width: number;
  
  /** 视口高度（必需） */
  height: number;
  
  /** 初始缩放比例 */
  initialScale?: number;
  
  /** 最小缩放比例 */
  minScale?: number;
  
  /** 最大缩放比例 */
  maxScale?: number;
  
  /** 是否初始适应宽度 */
  fitWidth?: boolean;
  
  /** 是否初始适应高度 */
  fitHeight?: boolean;
}
```

**默认值:**
```javascript
{
  initialScale: 1.0,
  minScale: 0.1,
  maxScale: 5.0,
  fitWidth: false,
  fitHeight: false,
}
```

**使用示例:**
```javascript
// 基础配置
const basicViewport = {
  width: 800,
  height: 600,
  initialScale: 1.0,
};

// 移动端优化配置
const mobileViewport = {
  width: window.innerWidth,
  height: window.innerHeight - 100,
  initialScale: 0.8,
  minScale: 0.5,
  maxScale: 3.0,
  fitWidth: true,
};

// 大屏幕配置
const desktopViewport = {
  width: 1200,
  height: 800,
  initialScale: 1.2,
  minScale: 0.2,
  maxScale: 8.0,
};
```

## 🎨 渲染配置

### RenderOptions

控制PDF页面的渲染质量和外观。

```typescript
interface RenderOptions {
  /** 缩放比例 */
  scale?: number;
  
  /** 旋转角度（度） */
  rotation?: number;
  
  /** 背景颜色 */
  backgroundColor?: string;
  
  /** 是否启用文本选择 */
  enableTextSelection?: boolean;
  
  /** 是否启用注释显示 */
  enableAnnotations?: boolean;
  
  /** 渲染质量等级 (1-5) */
  quality?: number;
}
```

**默认值:**
```javascript
{
  scale: 1.0,
  rotation: 0,
  backgroundColor: '#ffffff',
  enableTextSelection: true,
  enableAnnotations: true,
  quality: 3,
}
```

**质量等级说明:**

| 等级 | 描述 | 适用场景 | 性能影响 |
|------|------|----------|----------|
| 1 | 低质量 | 快速预览、低端设备 | 最快 |
| 2 | 较低质量 | 移动设备、网络较慢 | 较快 |
| 3 | 中等质量 | 一般桌面应用 | 平衡 |
| 4 | 较高质量 | 高分辨率显示器 | 较慢 |
| 5 | 高质量 | 打印预览、专业用途 | 最慢 |

**使用示例:**
```javascript
// 高质量配置（适合打印预览）
const highQualityRender = {
  quality: 5,
  backgroundColor: '#ffffff',
  enableTextSelection: true,
  enableAnnotations: true,
};

// 性能优先配置（适合移动端）
const performanceRender = {
  quality: 2,
  backgroundColor: '#f5f5f5',
  enableTextSelection: false,
  enableAnnotations: false,
};

// 深色主题配置
const darkThemeRender = {
  quality: 3,
  backgroundColor: '#2d3748',
  enableTextSelection: true,
  enableAnnotations: true,
};
```

## 💾 缓存配置

### CacheConfig

控制PDF页面的缓存策略。

```typescript
interface CacheConfig {
  /** 最大缓存页面数 */
  maxPages?: number;
  
  /** 最大内存使用量（字节） */
  maxMemory?: number;
  
  /** 缓存过期时间（毫秒） */
  expireTime?: number;
  
  /** 清理检查间隔（毫秒） */
  cleanupInterval?: number;
}
```

**默认值:**
```javascript
{
  maxPages: 10,
  maxMemory: 100 * 1024 * 1024, // 100MB
  expireTime: 5 * 60 * 1000,     // 5分钟
  cleanupInterval: 30 * 1000,    // 30秒
}
```

**内存计算:**
```javascript
// 估算单页内存使用量
const estimatePageMemory = (width, height, quality) => {
  const pixelRatio = window.devicePixelRatio || 1;
  const scaledWidth = width * quality * pixelRatio;
  const scaledHeight = height * quality * pixelRatio;
  return scaledWidth * scaledHeight * 4; // RGBA = 4字节/像素
};

// 示例：800x600页面，质量等级3
const pageMemory = estimatePageMemory(800, 600, 3);
console.log(`单页内存: ${(pageMemory / 1024 / 1024).toFixed(2)}MB`);
```

**使用示例:**
```javascript
// 大文档配置（多页面文档）
const largeDocumentCache = {
  maxPages: 20,
  maxMemory: 200 * 1024 * 1024, // 200MB
  expireTime: 10 * 60 * 1000,   // 10分钟
  cleanupInterval: 60 * 1000,   // 1分钟
};

// 移动端配置（内存受限）
const mobileCache = {
  maxPages: 5,
  maxMemory: 50 * 1024 * 1024,  // 50MB
  expireTime: 3 * 60 * 1000,    // 3分钟
  cleanupInterval: 15 * 1000,   // 15秒
};

// 服务器端配置（长时间运行）
const serverCache = {
  maxPages: 50,
  maxMemory: 500 * 1024 * 1024, // 500MB
  expireTime: 30 * 60 * 1000,   // 30分钟
  cleanupInterval: 5 * 60 * 1000, // 5分钟
};
```

## 🎛️ 组件配置

### Vue3组件配置

```vue
<template>
  <ElegantPDFViewer
    :src="pdfUrl"
    :width="800"
    :height="600"
    :initial-scale="1.2"
    :min-scale="0.1"
    :max-scale="5.0"
    :show-toolbar="true"
    :show-status-bar="true"
    :background-color="'#ffffff'"
    :quality="3"
    :enable-text-selection="true"
    :enable-annotations="true"
    :loading-text="'正在加载PDF文档...'"
    @document-loaded="onDocumentLoaded"
    @page-changed="onPageChanged"
    @scale-changed="onScaleChanged"
    @error="onError"
  />
</template>
```

### React组件配置

```jsx
<ElegantPDFViewer
  src={pdfUrl}
  width={800}
  height={600}
  initialScale={1.2}
  minScale={0.1}
  maxScale={5.0}
  showToolbar={true}
  showStatusBar={true}
  backgroundColor="#ffffff"
  quality={3}
  enableTextSelection={true}
  enableAnnotations={true}
  loadingText="正在加载PDF文档..."
  onDocumentLoaded={handleDocumentLoaded}
  onPageChanged={handlePageChanged}
  onScaleChanged={handleScaleChanged}
  onError={handleError}
/>
```

## 🚀 性能调优

### 根据设备类型调优

```javascript
/**
 * 根据设备性能自动调整配置
 */
function getOptimalConfig() {
  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const isLowEnd = navigator.hardwareConcurrency <= 2;
  const hasHighDPI = window.devicePixelRatio > 1;
  
  if (isMobile) {
    return {
      quality: isLowEnd ? 1 : 2,
      cache: {
        maxPages: 3,
        maxMemory: 30 * 1024 * 1024,
      },
      viewport: {
        initialScale: 0.8,
        minScale: 0.3,
        maxScale: 3.0,
      },
    };
  }
  
  if (isLowEnd) {
    return {
      quality: 2,
      cache: {
        maxPages: 5,
        maxMemory: 50 * 1024 * 1024,
      },
    };
  }
  
  return {
    quality: hasHighDPI ? 4 : 3,
    cache: {
      maxPages: 15,
      maxMemory: 150 * 1024 * 1024,
    },
  };
}
```

### 网络状况优化

```javascript
/**
 * 根据网络状况调整配置
 */
function getNetworkOptimizedConfig() {
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  
  if (connection) {
    const { effectiveType, downlink } = connection;
    
    // 慢速网络
    if (effectiveType === 'slow-2g' || effectiveType === '2g' || downlink < 0.5) {
      return {
        quality: 1,
        cache: {
          maxPages: 2,
          expireTime: 10 * 60 * 1000, // 延长缓存时间
        },
      };
    }
    
    // 中速网络
    if (effectiveType === '3g' || downlink < 2) {
      return {
        quality: 2,
        cache: {
          maxPages: 5,
        },
      };
    }
  }
  
  // 默认配置（假设快速网络）
  return {
    quality: 3,
    cache: {
      maxPages: 10,
    },
  };
}
```

## 📱 响应式配置

### 自适应视口

```javascript
/**
 * 创建响应式视口配置
 */
function createResponsiveViewport(container) {
  const updateViewport = () => {
    const rect = container.getBoundingClientRect();
    const isMobile = window.innerWidth < 768;
    
    return {
      width: rect.width,
      height: rect.height,
      initialScale: isMobile ? 0.8 : 1.0,
      minScale: isMobile ? 0.3 : 0.1,
      maxScale: isMobile ? 3.0 : 5.0,
      fitWidth: isMobile,
    };
  };
  
  // 监听窗口大小变化
  window.addEventListener('resize', () => {
    const newConfig = updateViewport();
    viewer.updateViewport(newConfig);
  });
  
  return updateViewport();
}
```

## 🎯 最佳实践

### 1. 配置优先级

```javascript
// 配置优先级：用户配置 > 环境配置 > 默认配置
const finalConfig = {
  ...defaultConfig,
  ...getEnvironmentConfig(),
  ...userConfig,
};
```

### 2. 配置验证

```javascript
/**
 * 验证配置的有效性
 */
function validateConfig(config) {
  const errors = [];
  
  // 验证必需字段
  if (!config.container) {
    errors.push('container is required');
  }
  
  // 验证数值范围
  if (config.viewport?.initialScale < 0.1 || config.viewport?.initialScale > 10) {
    errors.push('initialScale must be between 0.1 and 10');
  }
  
  if (config.renderOptions?.quality < 1 || config.renderOptions?.quality > 5) {
    errors.push('quality must be between 1 and 5');
  }
  
  // 验证内存限制
  if (config.cache?.maxMemory < 10 * 1024 * 1024) {
    errors.push('maxMemory should be at least 10MB');
  }
  
  if (errors.length > 0) {
    throw new Error(`Configuration errors: ${errors.join(', ')}`);
  }
  
  return true;
}
```

### 3. 动态配置更新

```javascript
/**
 * 动态更新配置
 */
class ConfigManager {
  constructor(viewer) {
    this.viewer = viewer;
    this.config = {};
  }
  
  updateRenderQuality(quality) {
    this.config.renderOptions = {
      ...this.config.renderOptions,
      quality,
    };
    this.viewer.updateRenderOptions(this.config.renderOptions);
  }
  
  updateCacheSettings(cacheConfig) {
    this.config.cache = {
      ...this.config.cache,
      ...cacheConfig,
    };
    this.viewer.updateCacheConfig(this.config.cache);
  }
  
  adaptToPerformance() {
    const performanceConfig = getOptimalConfig();
    this.updateRenderQuality(performanceConfig.quality);
    this.updateCacheSettings(performanceConfig.cache);
  }
}
```

### 4. 配置持久化

```javascript
/**
 * 保存和恢复用户配置
 */
class ConfigPersistence {
  static save(config) {
    const serializable = {
      viewport: config.viewport,
      renderOptions: config.renderOptions,
      cache: config.cache,
    };
    localStorage.setItem('pdfViewerConfig', JSON.stringify(serializable));
  }
  
  static load() {
    try {
      const saved = localStorage.getItem('pdfViewerConfig');
      return saved ? JSON.parse(saved) : {};
    } catch (error) {
      console.warn('Failed to load saved config:', error);
      return {};
    }
  }
  
  static clear() {
    localStorage.removeItem('pdfViewerConfig');
  }
}
```

## 🔧 调试配置

### 启用调试模式

```javascript
const viewer = new PDFViewer({
  container: element,
  debugMode: true, // 启用调试模式
});

// 调试模式下可用的方法
viewer.getDebugInfo(); // 获取调试信息
viewer.exportConfig(); // 导出当前配置
viewer.validateConfig(); // 验证配置
```

### 性能监控

```javascript
// 监控配置对性能的影响
viewer.addEventListener('configChanged', (event) => {
  console.log('配置变更:', event.config);
  console.log('性能影响:', event.performanceImpact);
});

viewer.addEventListener('performanceWarning', (event) => {
  console.warn('性能警告:', event.message);
  console.log('建议配置:', event.suggestedConfig);
});
```

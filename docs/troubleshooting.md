# 🔧 故障排除指南

> 雅致PDF预览器常见问题解决方案

## 📋 目录

- [安装问题](#安装问题)
- [加载问题](#加载问题)
- [渲染问题](#渲染问题)
- [性能问题](#性能问题)
- [兼容性问题](#兼容性问题)
- [框架集成问题](#框架集成问题)

## 🚨 安装问题

### 问题：npm install 失败

**症状：**
```bash
npm ERR! peer dep missing: vue@^3.0.0
```

**解决方案：**
```bash
# 确保安装了正确的框架版本
npm install vue@^3.0.0  # Vue3项目
npm install vue@^2.6.0  # Vue2项目
npm install react@^16.8.0 react-dom@^16.8.0  # React项目

# 然后安装PDF预览器
npm install @elegant-pdf/vue3
```

### 问题：TypeScript类型错误

**症状：**
```
Cannot find module '@elegant-pdf/core' or its corresponding type declarations
```

**解决方案：**
```bash
# 安装类型定义
npm install @types/node --save-dev

# 确保tsconfig.json包含正确配置
{
  "compilerOptions": {
    "moduleResolution": "node",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true
  }
}
```

## 📄 加载问题

### 问题：PDF文件加载失败

**症状：**
```
Error: Failed to load PDF document
```

**可能原因和解决方案：**

#### 1. CORS跨域问题
```javascript
// 解决方案1：使用代理
const proxyUrl = '/api/proxy?url=' + encodeURIComponent(pdfUrl);
viewer.loadDocument(proxyUrl);

// 解决方案2：服务器设置CORS头
// Access-Control-Allow-Origin: *
// Access-Control-Allow-Methods: GET, POST, OPTIONS
```

#### 2. 文件格式不支持
```javascript
// 检查文件类型
const file = event.target.files[0];
if (file.type !== 'application/pdf') {
  throw new Error('只支持PDF格式文件');
}

// 检查文件大小
if (file.size > 50 * 1024 * 1024) { // 50MB
  throw new Error('文件过大，请选择小于50MB的文件');
}
```

#### 3. 网络连接问题
```javascript
// 添加重试机制
async function loadWithRetry(url, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await viewer.loadDocument(url);
      return;
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}
```

### 问题：文件加载缓慢

**优化方案：**
```javascript
// 1. 启用流式加载
const viewer = new PDFViewer({
  container: element,
  loadingStrategy: 'streaming', // 流式加载
});

// 2. 预加载关键页面
viewer.addEventListener('documentLoaded', () => {
  viewer.preloadPages([1, 2, 3]); // 预加载前3页
});

// 3. 压缩传输
// 服务器端启用gzip压缩
```

## 🎨 渲染问题

### 问题：页面显示模糊

**症状：**
文本和图像在高DPI屏幕上显示模糊

**解决方案：**
```javascript
// 1. 调整渲染质量
const viewer = new PDFViewer({
  renderOptions: {
    quality: window.devicePixelRatio > 1 ? 4 : 3,
  },
});

// 2. 手动设置Canvas分辨率
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
const ratio = window.devicePixelRatio || 1;

canvas.width = canvas.offsetWidth * ratio;
canvas.height = canvas.offsetHeight * ratio;
ctx.scale(ratio, ratio);
```

### 问题：渲染颜色不正确

**解决方案：**
```javascript
// 1. 设置正确的颜色空间
const viewer = new PDFViewer({
  renderOptions: {
    colorSpace: 'sRGB', // 或 'display-p3'
    backgroundColor: '#ffffff',
  },
});

// 2. 检查CSS颜色配置
.pdf-viewer canvas {
  color-profile: sRGB;
  image-rendering: -webkit-optimize-contrast;
}
```

### 问题：文本选择不工作

**解决方案：**
```javascript
// 1. 确保启用文本选择
const viewer = new PDFViewer({
  renderOptions: {
    enableTextSelection: true,
  },
});

// 2. 检查CSS样式
.pdf-viewer {
  user-select: text;
  -webkit-user-select: text;
  -moz-user-select: text;
}
```

## ⚡ 性能问题

### 问题：内存占用过高

**症状：**
浏览器内存使用量持续增长，最终导致页面崩溃

**解决方案：**
```javascript
// 1. 限制缓存大小
const viewer = new PDFViewer({
  cache: {
    maxPages: 5,  // 减少缓存页数
    maxMemory: 50 * 1024 * 1024, // 限制内存50MB
    expireTime: 2 * 60 * 1000,   // 2分钟过期
  },
});

// 2. 定期清理缓存
setInterval(() => {
  viewer.clearCache();
}, 5 * 60 * 1000); // 每5分钟清理一次

// 3. 监控内存使用
viewer.addEventListener('memoryWarning', (event) => {
  console.warn('内存使用过高:', event.memoryUsage);
  viewer.clearCache();
});
```

### 问题：页面切换卡顿

**解决方案：**
```javascript
// 1. 启用页面预加载
viewer.addEventListener('pageChanged', (event) => {
  const { pageNumber } = event;
  const preloadPages = [pageNumber + 1, pageNumber + 2];
  viewer.preloadPages(preloadPages);
});

// 2. 使用防抖优化
const debouncedRender = debounce(() => {
  viewer.renderCurrentPage();
}, 100);

// 3. 降低渲染质量
const viewer = new PDFViewer({
  renderOptions: {
    quality: 2, // 降低质量提升性能
  },
});
```

## 🌐 兼容性问题

### 问题：Safari浏览器显示异常

**解决方案：**
```javascript
// 1. Safari特殊处理
const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
if (isSafari) {
  viewer.updateConfig({
    renderOptions: {
      quality: 3, // Safari使用中等质量
      useWebGL: false, // 禁用WebGL
    },
  });
}

// 2. 添加Safari CSS前缀
.pdf-viewer canvas {
  -webkit-transform: translateZ(0);
  -webkit-backface-visibility: hidden;
}
```

### 问题：移动端触摸事件冲突

**解决方案：**
```javascript
// 1. 禁用默认触摸行为
viewer.container.addEventListener('touchstart', (e) => {
  e.preventDefault();
}, { passive: false });

// 2. 自定义触摸手势
let startDistance = 0;
viewer.container.addEventListener('touchstart', (e) => {
  if (e.touches.length === 2) {
    startDistance = getDistance(e.touches[0], e.touches[1]);
  }
});

viewer.container.addEventListener('touchmove', (e) => {
  if (e.touches.length === 2) {
    const currentDistance = getDistance(e.touches[0], e.touches[1]);
    const scale = currentDistance / startDistance;
    viewer.setScale(viewer.getScale() * scale);
  }
});
```

## 🔧 框架集成问题

### Vue3问题：组件不响应数据变化

**解决方案：**
```vue
<template>
  <ElegantPDFViewer
    :key="pdfKey"
    :src="pdfSrc"
    @document-loaded="onDocumentLoaded"
  />
</template>

<script setup>
import { ref, watch } from 'vue';

const pdfSrc = ref(null);
const pdfKey = ref(0);

// 强制重新渲染
watch(pdfSrc, () => {
  pdfKey.value++;
});
</script>
```

### React问题：内存泄漏

**解决方案：**
```jsx
import { useEffect, useRef } from 'react';

function PDFViewer({ src }) {
  const viewerRef = useRef(null);
  
  useEffect(() => {
    return () => {
      // 组件卸载时清理资源
      if (viewerRef.current) {
        viewerRef.current.destroy();
      }
    };
  }, []);
  
  return <ElegantPDFViewer ref={viewerRef} src={src} />;
}
```

### Vue2问题：事件监听器未清理

**解决方案：**
```vue
<script>
export default {
  data() {
    return {
      viewer: null,
    };
  },
  
  beforeDestroy() {
    // 清理事件监听器
    if (this.viewer) {
      this.viewer.removeAllListeners();
      this.viewer.destroy();
    }
  },
};
</script>
```

## 🔍 调试技巧

### 启用调试模式

```javascript
const viewer = new PDFViewer({
  debugMode: true, // 启用调试模式
});

// 查看调试信息
console.log(viewer.getDebugInfo());
```

### 性能分析

```javascript
// 监控渲染性能
viewer.addEventListener('pageRendered', (event) => {
  console.log(`页面${event.pageNumber}渲染耗时: ${event.renderTime}ms`);
});

// 监控内存使用
viewer.addEventListener('memoryUpdate', (event) => {
  console.log('内存使用:', event.memoryUsage);
});
```

### 网络请求分析

```javascript
// 监控网络请求
viewer.addEventListener('networkRequest', (event) => {
  console.log('网络请求:', event.url, event.status);
});
```

## 📞 获取帮助

如果以上解决方案都无法解决你的问题，请通过以下方式获取帮助：

1. **查看控制台错误** - 检查浏览器开发者工具中的错误信息
2. **提供详细信息** - 包括浏览器版本、框架版本、错误截图
3. **创建最小复现** - 提供能重现问题的最小代码示例
4. **提交Issue** - 在GitHub上创建详细的问题报告

### 问题报告模板

```markdown
## 问题描述
简要描述遇到的问题

## 环境信息
- 浏览器: Chrome 91.0.4472.124
- 框架: Vue 3.2.0
- 预览器版本: @elegant-pdf/vue3@1.0.0

## 重现步骤
1. 打开页面
2. 加载PDF文件
3. 点击下一页按钮
4. 出现错误

## 期望行为
应该正常切换到下一页

## 实际行为
页面卡住，控制台报错

## 错误信息
```
Error: Cannot read property 'pageNumber' of undefined
```

## 相关代码
```javascript
// 相关代码片段
```
```

---

希望这个故障排除指南能帮助你快速解决问题！如果还有其他问题，欢迎随时联系我们。

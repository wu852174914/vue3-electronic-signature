<template>
  <div class="pdf-viewer" :class="{ 'is-loading': loading, 'has-error': !!error }">
    <!-- 工具栏 -->
    <div v-if="showToolbar" class="pdf-toolbar">
      <div class="toolbar-left">
        <button 
          class="toolbar-btn" 
          :disabled="!canGoPrevious"
          @click="previousPage"
          title="上一页"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
          </svg>
        </button>
        
        <span class="page-info">
          {{ currentPage }} / {{ pageCount }}
        </span>
        
        <button 
          class="toolbar-btn" 
          :disabled="!canGoNext"
          @click="nextPage"
          title="下一页"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
          </svg>
        </button>
      </div>
      
      <div class="toolbar-center">
        <input
          type="number"
          v-model.number="targetPage"
          :min="1"
          :max="pageCount"
          @keyup.enter="goToPage(targetPage)"
          class="page-input"
          :disabled="!documentLoaded"
        />
        <button 
          @click="goToPage(targetPage)" 
          class="toolbar-btn"
          :disabled="!documentLoaded"
        >
          跳转
        </button>
      </div>
      
      <div class="toolbar-right">
        <button 
          class="toolbar-btn" 
          @click="zoomOut"
          :disabled="!canZoomOut"
          title="缩小"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 13H5v-2h14v2z"/>
          </svg>
        </button>
        
        <span class="zoom-info">
          {{ Math.round(scale * 100) }}%
        </span>
        
        <button 
          class="toolbar-btn" 
          @click="zoomIn"
          :disabled="!canZoomIn"
          title="放大"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
          </svg>
        </button>
        
        <button 
          class="toolbar-btn" 
          @click="fitWidth"
          :disabled="!documentLoaded"
          title="适应宽度"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- PDF内容区域 -->
    <div class="pdf-content" ref="contentRef">
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-overlay">
        <div class="loading-spinner"></div>
        <p>正在加载PDF文档...</p>
      </div>
      
      <!-- 错误状态 -->
      <div v-else-if="error" class="error-overlay">
        <div class="error-icon">⚠️</div>
        <h3>加载失败</h3>
        <p>{{ error }}</p>
        <button @click="retry" class="retry-btn">重试</button>
      </div>
      
      <!-- PDF渲染区域 -->
      <div v-else-if="documentLoaded" class="pdf-pages">
        <canvas
          ref="canvasRef"
          class="pdf-canvas"
          :style="canvasStyle"
          @wheel="handleWheel"
          @mousedown="handleMouseDown"
          @mousemove="handleMouseMove"
          @mouseup="handleMouseUp"
          @mouseleave="handleMouseUp"
        ></canvas>
      </div>
      
      <!-- 空状态 -->
      <div v-else class="empty-state">
        <div class="empty-icon">📄</div>
        <h3>请选择PDF文件</h3>
        <p>支持本地文件和远程URL</p>
      </div>
    </div>

    <!-- 状态栏 -->
    <div v-if="showStatusBar && documentLoaded" class="pdf-status-bar">
      <span>文档: {{ documentInfo?.title || '未知' }}</span>
      <span>页面: {{ currentPage }}/{{ pageCount }}</span>
      <span>缩放: {{ Math.round(scale * 100) }}%</span>
      <span v-if="documentInfo?.author">作者: {{ documentInfo.author }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'

// ==================== Props定义 ====================

interface Props {
  /** PDF数据源 */
  src?: string | File | ArrayBuffer | null
  /** 是否显示工具栏 */
  showToolbar?: boolean
  /** 是否显示状态栏 */
  showStatusBar?: boolean
  /** 初始缩放比例 */
  initialScale?: number
  /** 最小缩放比例 */
  minScale?: number
  /** 最大缩放比例 */
  maxScale?: number
  /** 背景颜色 */
  backgroundColor?: string
  /** 渲染质量 */
  quality?: number
}

const props = withDefaults(defineProps<Props>(), {
  showToolbar: true,
  showStatusBar: true,
  initialScale: 1.0,
  minScale: 0.1,
  maxScale: 5.0,
  backgroundColor: '#ffffff',
  quality: 2
})

// ==================== Emits定义 ====================

interface Emits {
  /** 文档加载完成 */
  documentLoaded: [info: any]
  /** 页面变化 */
  pageChanged: [page: number]
  /** 缩放变化 */
  scaleChanged: [scale: number]
  /** 错误发生 */
  error: [error: string]
}

const emit = defineEmits<Emits>()

// ==================== 响应式数据 ====================

const contentRef = ref<HTMLElement>()
const canvasRef = ref<HTMLCanvasElement>()

const loading = ref(false)
const error = ref('')
const documentLoaded = ref(false)
const documentInfo = ref<any>(null)
const currentPage = ref(1)
const pageCount = ref(0)
const scale = ref(props.initialScale)
const targetPage = ref(1)

// 鼠标交互状态
const isDragging = ref(false)
const lastMousePos = ref({ x: 0, y: 0 })
const canvasOffset = ref({ x: 0, y: 0 })

// ==================== 计算属性 ====================

const canGoPrevious = computed(() => currentPage.value > 1)
const canGoNext = computed(() => currentPage.value < pageCount.value)
const canZoomIn = computed(() => scale.value < props.maxScale)
const canZoomOut = computed(() => scale.value > props.minScale)

const canvasStyle = computed(() => ({
  transform: `scale(${scale.value}) translate(${canvasOffset.value.x}px, ${canvasOffset.value.y}px)`,
  transformOrigin: 'center center',
  cursor: isDragging.value ? 'grabbing' : 'grab'
}))

// ==================== 方法定义 ====================

/**
 * 加载PDF文档
 */
const loadDocument = async (source: string | File | ArrayBuffer) => {
  if (!source) return
  
  loading.value = true
  error.value = ''
  
  try {
    // 这里是简化的实现，实际项目中需要集成真正的PDF解析库
    await simulateLoadPDF(source)
    
    documentLoaded.value = true
    emit('documentLoaded', documentInfo.value)
    
  } catch (err: any) {
    error.value = err.message || '加载PDF失败'
    emit('error', error.value)
  } finally {
    loading.value = false
  }
}

/**
 * 模拟PDF加载（实际项目中替换为真实实现）
 */
const simulateLoadPDF = async (source: string | File | ArrayBuffer): Promise<void> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // 模拟文档信息
      documentInfo.value = {
        title: typeof source === 'string' ? source.split('/').pop() : '本地PDF文档',
        author: '未知作者',
        pageCount: Math.floor(Math.random() * 20) + 5, // 5-24页
        version: '1.4'
      }
      
      pageCount.value = documentInfo.value.pageCount
      currentPage.value = 1
      targetPage.value = 1
      
      // 模拟渲染第一页
      renderPage(1)
      
      resolve()
    }, 1000 + Math.random() * 1000) // 1-2秒加载时间
  })
}

/**
 * 渲染指定页面
 */
const renderPage = async (pageNumber: number) => {
  if (!canvasRef.value || !documentLoaded.value) return
  
  const canvas = canvasRef.value
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  
  // 设置Canvas尺寸
  const containerRect = contentRef.value?.getBoundingClientRect()
  if (containerRect) {
    canvas.width = containerRect.width * window.devicePixelRatio
    canvas.height = containerRect.height * window.devicePixelRatio
    canvas.style.width = `${containerRect.width}px`
    canvas.style.height = `${containerRect.height}px`
    
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
  }
  
  // 清除画布
  ctx.fillStyle = props.backgroundColor
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  
  // 模拟PDF页面内容
  ctx.fillStyle = '#333'
  ctx.font = '24px Arial'
  ctx.textAlign = 'center'
  ctx.fillText(`PDF页面 ${pageNumber}`, canvas.width / 2 / window.devicePixelRatio, 100)
  
  ctx.font = '16px Arial'
  ctx.fillText(`这里是第${pageNumber}页的内容`, canvas.width / 2 / window.devicePixelRatio, 150)
  ctx.fillText('实际项目中这里会显示真实的PDF内容', canvas.width / 2 / window.devicePixelRatio, 180)
  
  // 绘制一些模拟内容
  ctx.strokeStyle = '#666'
  ctx.lineWidth = 1
  for (let i = 0; i < 10; i++) {
    const y = 220 + i * 30
    ctx.beginPath()
    ctx.moveTo(50, y)
    ctx.lineTo(canvas.width / window.devicePixelRatio - 50, y)
    ctx.stroke()
  }
}

/**
 * 跳转到指定页面
 */
const goToPage = async (pageNumber: number) => {
  if (pageNumber < 1 || pageNumber > pageCount.value) return
  
  currentPage.value = pageNumber
  targetPage.value = pageNumber
  
  await renderPage(pageNumber)
  emit('pageChanged', pageNumber)
}

/**
 * 上一页
 */
const previousPage = () => {
  if (canGoPrevious.value) {
    goToPage(currentPage.value - 1)
  }
}

/**
 * 下一页
 */
const nextPage = () => {
  if (canGoNext.value) {
    goToPage(currentPage.value + 1)
  }
}

/**
 * 放大
 */
const zoomIn = () => {
  if (canZoomIn.value) {
    const newScale = Math.min(scale.value * 1.2, props.maxScale)
    setScale(newScale)
  }
}

/**
 * 缩小
 */
const zoomOut = () => {
  if (canZoomOut.value) {
    const newScale = Math.max(scale.value / 1.2, props.minScale)
    setScale(newScale)
  }
}

/**
 * 设置缩放比例
 */
const setScale = (newScale: number) => {
  scale.value = Math.max(props.minScale, Math.min(props.maxScale, newScale))
  emit('scaleChanged', scale.value)
}

/**
 * 适应宽度
 */
const fitWidth = () => {
  if (!contentRef.value) return
  
  const containerWidth = contentRef.value.clientWidth
  const canvasWidth = canvasRef.value?.clientWidth || 800
  const newScale = (containerWidth - 40) / canvasWidth // 留20px边距
  
  setScale(newScale)
  canvasOffset.value = { x: 0, y: 0 }
}

/**
 * 重试加载
 */
const retry = () => {
  if (props.src) {
    loadDocument(props.src)
  }
}

// ==================== 鼠标事件处理 ====================

const handleWheel = (event: WheelEvent) => {
  event.preventDefault()
  
  if (event.ctrlKey || event.metaKey) {
    // Ctrl+滚轮缩放
    const delta = event.deltaY > 0 ? -0.1 : 0.1
    const newScale = scale.value + delta
    setScale(newScale)
  } else {
    // 普通滚轮平移
    canvasOffset.value.y -= event.deltaY * 0.5
    canvasOffset.value.x -= event.deltaX * 0.5
  }
}

const handleMouseDown = (event: MouseEvent) => {
  isDragging.value = true
  lastMousePos.value = { x: event.clientX, y: event.clientY }
}

const handleMouseMove = (event: MouseEvent) => {
  if (!isDragging.value) return
  
  const deltaX = event.clientX - lastMousePos.value.x
  const deltaY = event.clientY - lastMousePos.value.y
  
  canvasOffset.value.x += deltaX
  canvasOffset.value.y += deltaY
  
  lastMousePos.value = { x: event.clientX, y: event.clientY }
}

const handleMouseUp = () => {
  isDragging.value = false
}

// ==================== 键盘事件处理 ====================

const handleKeyDown = (event: KeyboardEvent) => {
  if (!documentLoaded.value) return
  
  switch (event.key) {
    case 'ArrowLeft':
    case 'PageUp':
      event.preventDefault()
      previousPage()
      break
    case 'ArrowRight':
    case 'PageDown':
    case ' ':
      event.preventDefault()
      nextPage()
      break
    case 'Home':
      event.preventDefault()
      goToPage(1)
      break
    case 'End':
      event.preventDefault()
      goToPage(pageCount.value)
      break
    case '+':
    case '=':
      if (event.ctrlKey || event.metaKey) {
        event.preventDefault()
        zoomIn()
      }
      break
    case '-':
      if (event.ctrlKey || event.metaKey) {
        event.preventDefault()
        zoomOut()
      }
      break
    case '0':
      if (event.ctrlKey || event.metaKey) {
        event.preventDefault()
        setScale(1.0)
        canvasOffset.value = { x: 0, y: 0 }
      }
      break
  }
}

// ==================== 监听器 ====================

watch(() => props.src, (newSrc) => {
  if (newSrc) {
    loadDocument(newSrc)
  } else {
    documentLoaded.value = false
    documentInfo.value = null
    currentPage.value = 1
    pageCount.value = 0
    error.value = ''
  }
}, { immediate: true })

// ==================== 生命周期 ====================

onMounted(() => {
  document.addEventListener('keydown', handleKeyDown)
  
  // 监听窗口大小变化
  const handleResize = () => {
    if (documentLoaded.value) {
      nextTick(() => {
        renderPage(currentPage.value)
      })
    }
  }
  
  window.addEventListener('resize', handleResize)
  
  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeyDown)
    window.removeEventListener('resize', handleResize)
  })
})

// ==================== 暴露的方法 ====================

defineExpose({
  loadDocument,
  goToPage,
  previousPage,
  nextPage,
  zoomIn,
  zoomOut,
  setScale,
  fitWidth,
  getCurrentPage: () => currentPage.value,
  getPageCount: () => pageCount.value,
  getScale: () => scale.value,
  getDocumentInfo: () => documentInfo.value
})
</script>

<style scoped>
.pdf-viewer {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #f5f5f5;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.pdf-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  background: white;
  border-bottom: 1px solid #e0e0e0;
  flex-shrink: 0;
}

.toolbar-left,
.toolbar-center,
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toolbar-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid #d0d0d0;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  color: #666;
}

.toolbar-btn:hover:not(:disabled) {
  background: #f0f0f0;
  border-color: #b0b0b0;
}

.toolbar-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info,
.zoom-info {
  font-size: 14px;
  color: #666;
  min-width: 60px;
  text-align: center;
}

.page-input {
  width: 60px;
  height: 32px;
  padding: 4px 8px;
  border: 1px solid #d0d0d0;
  border-radius: 4px;
  text-align: center;
  font-size: 14px;
}

.pdf-content {
  flex: 1;
  position: relative;
  overflow: hidden;
  background: #e0e0e0;
}

.loading-overlay,
.error-overlay,
.empty-state {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: white;
  color: #666;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f0f0f0;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-icon,
.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.retry-btn {
  margin-top: 16px;
  padding: 8px 16px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.pdf-pages {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pdf-canvas {
  max-width: 100%;
  max-height: 100%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  background: white;
  transition: transform 0.1s ease-out;
}

.pdf-status-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px 16px;
  background: #f8f8f8;
  border-top: 1px solid #e0e0e0;
  font-size: 12px;
  color: #666;
  flex-shrink: 0;
}

.pdf-status-bar span {
  white-space: nowrap;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .pdf-toolbar {
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .toolbar-center {
    order: 3;
    flex-basis: 100%;
    justify-content: center;
  }
  
  .pdf-status-bar {
    flex-wrap: wrap;
    gap: 8px;
  }
}
</style>

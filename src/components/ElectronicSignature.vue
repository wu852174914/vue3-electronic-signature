<template>
  <div 
    class="electronic-signature"
    :style="containerStyle"
  >
    <canvas
      ref="canvasRef"
      :width="canvasWidth"
      :height="canvasHeight"
      :style="canvasStyle"
      @mousedown="handleMouseDown"
      @mousemove="handleMouseMove"
      @mouseup="handleMouseUp"
      @mouseleave="handleMouseUp"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
      @touchcancel="handleTouchEnd"
    />
    
    <!-- 占位符文本 -->
    <div 
      v-if="showPlaceholder"
      class="signature-placeholder"
      :style="placeholderStyle"
    >
      {{ placeholder }}
    </div>
    
    <!-- 工具栏（可选） -->
    <div v-if="showToolbar" class="signature-toolbar">
      <button @click="clear" :disabled="disabled">清除</button>
      <button @click="undo" :disabled="disabled || !canUndo">撤销</button>
      <button @click="redo" :disabled="disabled || !canRedo">重做</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  computed,
  onMounted,
  onUnmounted,
  watch,
  nextTick,
  defineEmits,
  defineExpose,
  defineProps,
  withDefaults
} from 'vue'
import type {
  SignatureProps,
  SignaturePoint,
  SignaturePath,
  SignatureData,
  ExportOptions,
  DrawOptions,
  SignatureMethods
} from '../types'
import {
  drawSmoothPath,
  exportSignature,
  loadImageToCanvas,
  isSignatureEmpty,
  createEmptySignatureData,
  cloneSignatureData
} from '../utils/signature'

// 组件属性
interface ElectronicSignatureProps extends SignatureProps {
  showToolbar?: boolean
}

const props = withDefaults(defineProps<ElectronicSignatureProps>(), {
  width: '100%',
  height: 300,
  strokeColor: '#000000',
  strokeWidth: 2,
  backgroundColor: 'transparent',
  disabled: false,
  placeholder: '请在此处签名',
  smoothing: true,
  pressureSensitive: false,
  minStrokeWidth: 1,
  maxStrokeWidth: 4,
  borderStyle: '1px solid #ddd',
  borderRadius: '4px',
  showToolbar: false
})

// 事件定义
const emit = defineEmits<{
  'signature-start': []
  'signature-drawing': [data: SignatureData]
  'signature-end': [data: SignatureData]
  'signature-clear': []
  'signature-undo': [data: SignatureData]
  'signature-redo': [data: SignatureData]
}>()

// 响应式引用
const canvasRef = ref<HTMLCanvasElement>()
const isDrawing = ref(false)
const currentPath = ref<SignaturePath | null>(null)
const signatureData = ref<SignatureData>(createEmptySignatureData(0, 0))
const history = ref<SignatureData[]>([])
const historyIndex = ref(-1)

// 计算属性
const canvasWidth = computed(() => {
  return typeof props.width === 'number' ? props.width : 800
})

const canvasHeight = computed(() => {
  return typeof props.height === 'number' ? props.height : 300
})

const containerStyle = computed(() => ({
  position: 'relative' as const,
  display: 'inline-block' as const,
  width: typeof props.width === 'string' ? props.width : `${props.width}px`,
  height: typeof props.height === 'string' ? props.height : `${props.height}px`
}))

const canvasStyle = computed(() => ({
  border: props.borderStyle,
  borderRadius: props.borderRadius,
  backgroundColor: props.backgroundColor,
  cursor: props.disabled ? 'not-allowed' : 'crosshair',
  display: 'block',
  width: '100%',
  height: '100%'
}))

const placeholderStyle = computed(() => ({
  position: 'absolute' as const,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  color: '#999',
  fontSize: '14px',
  pointerEvents: 'none' as const,
  userSelect: 'none' as const
}))

const showPlaceholder = computed(() => {
  return props.placeholder && isSignatureEmpty(signatureData.value)
})

const canUndo = computed(() => historyIndex.value > 0)
const canRedo = computed(() => historyIndex.value < history.value.length - 1)

const drawOptions = computed((): DrawOptions => ({
  strokeColor: props.strokeColor,
  strokeWidth: props.strokeWidth,
  smoothing: props.smoothing,
  pressure: {
    enabled: props.pressureSensitive,
    min: props.minStrokeWidth,
    max: props.maxStrokeWidth
  }
}))

// 获取画布上下文
const getContext = (): CanvasRenderingContext2D | null => {
  return canvasRef.value?.getContext('2d') || null
}

// 获取相对于画布的坐标
const getCanvasPoint = (clientX: number, clientY: number): SignaturePoint => {
  const canvas = canvasRef.value!
  const rect = canvas.getBoundingClientRect()
  const scaleX = canvas.width / rect.width
  const scaleY = canvas.height / rect.height
  
  return {
    x: (clientX - rect.left) * scaleX,
    y: (clientY - rect.top) * scaleY,
    time: Date.now()
  }
}

// 开始绘制
const startDrawing = (point: SignaturePoint): void => {
  if (props.disabled) return
  
  isDrawing.value = true
  currentPath.value = {
    points: [point],
    strokeColor: props.strokeColor,
    strokeWidth: props.strokeWidth
  }
  
  emit('signature-start')
}

// 继续绘制
const continueDrawing = (point: SignaturePoint): void => {
  if (!isDrawing.value || !currentPath.value || props.disabled) return
  
  currentPath.value.points.push(point)
  
  // 实时绘制
  const ctx = getContext()
  if (ctx) {
    drawSmoothPath(ctx, currentPath.value.points, drawOptions.value)
  }
  
  // 更新签名数据
  updateSignatureData()
  emit('signature-drawing', signatureData.value)
}

// 结束绘制
const endDrawing = (): void => {
  if (!isDrawing.value || !currentPath.value) return

  isDrawing.value = false

  // 添加路径到签名数据
  signatureData.value.paths.push(currentPath.value)
  signatureData.value.isEmpty = false
  signatureData.value.timestamp = Date.now()

  // 保存到历史记录
  saveToHistory()

  currentPath.value = null
  emit('signature-end', signatureData.value)
}

// 鼠标事件处理
const handleMouseDown = (event: MouseEvent): void => {
  event.preventDefault()
  const point = getCanvasPoint(event.clientX, event.clientY)
  startDrawing(point)
}

const handleMouseMove = (event: MouseEvent): void => {
  event.preventDefault()
  if (!isDrawing.value) return
  const point = getCanvasPoint(event.clientX, event.clientY)
  continueDrawing(point)
}

const handleMouseUp = (event: MouseEvent): void => {
  event.preventDefault()
  endDrawing()
}

// 触摸事件处理
const handleTouchStart = (event: TouchEvent): void => {
  event.preventDefault()
  if (event.touches.length !== 1) return
  const touch = event.touches[0]
  const point = getCanvasPoint(touch.clientX, touch.clientY)
  startDrawing(point)
}

const handleTouchMove = (event: TouchEvent): void => {
  event.preventDefault()
  if (event.touches.length !== 1 || !isDrawing.value) return
  const touch = event.touches[0]
  const point = getCanvasPoint(touch.clientX, touch.clientY)
  continueDrawing(point)
}

const handleTouchEnd = (event: TouchEvent): void => {
  event.preventDefault()
  endDrawing()
}

// 更新签名数据
const updateSignatureData = (): void => {
  signatureData.value.canvasSize = {
    width: canvasWidth.value,
    height: canvasHeight.value
  }
  signatureData.value.isEmpty = isSignatureEmpty(signatureData.value)
}

// 保存到历史记录
const saveToHistory = (): void => {
  // 移除当前位置之后的历史记录
  history.value = history.value.slice(0, historyIndex.value + 1)
  // 添加新的状态
  history.value.push(cloneSignatureData(signatureData.value))
  historyIndex.value = history.value.length - 1

  // 限制历史记录数量
  const maxHistory = 50
  if (history.value.length > maxHistory) {
    history.value = history.value.slice(-maxHistory)
    historyIndex.value = history.value.length - 1
  }
}

// 重绘画布
const redrawCanvas = (): void => {
  const ctx = getContext()
  if (!ctx) return

  // 清除画布
  ctx.clearRect(0, 0, canvasWidth.value, canvasHeight.value)

  // 设置背景
  if (props.backgroundColor && props.backgroundColor !== 'transparent') {
    ctx.fillStyle = props.backgroundColor
    ctx.fillRect(0, 0, canvasWidth.value, canvasHeight.value)
  }

  // 绘制所有路径
  signatureData.value.paths.forEach((path: SignaturePath) => {
    if (path.points.length > 0) {
      const pathDrawOptions: DrawOptions = {
        strokeColor: path.strokeColor,
        strokeWidth: path.strokeWidth,
        smoothing: props.smoothing,
        pressure: drawOptions.value.pressure
      }
      drawSmoothPath(ctx, path.points, pathDrawOptions)
    }
  })
}

// 组件方法实现
const clear = (): void => {
  if (props.disabled) return

  signatureData.value = createEmptySignatureData(canvasWidth.value, canvasHeight.value)
  redrawCanvas()
  saveToHistory()
  emit('signature-clear')
}

const undo = (): void => {
  if (!canUndo.value || props.disabled) return

  historyIndex.value--
  signatureData.value = cloneSignatureData(history.value[historyIndex.value])
  redrawCanvas()
  emit('signature-undo', signatureData.value)
}

const redo = (): void => {
  if (!canRedo.value || props.disabled) return

  historyIndex.value++
  signatureData.value = cloneSignatureData(history.value[historyIndex.value])
  redrawCanvas()
  emit('signature-redo', signatureData.value)
}

const save = (options?: ExportOptions): string => {
  const canvas = canvasRef.value!
  return exportSignature(canvas, signatureData.value, options)
}

const isEmpty = (): boolean => {
  return isSignatureEmpty(signatureData.value)
}

const fromDataURL = async (dataURL: string): Promise<void> => {
  if (props.disabled) return

  const canvas = canvasRef.value!
  await loadImageToCanvas(canvas, dataURL)

  // 重置签名数据（因为从图片加载无法恢复路径信息）
  signatureData.value = createEmptySignatureData(canvasWidth.value, canvasHeight.value)
  signatureData.value.isEmpty = false
  saveToHistory()
}

const getSignatureData = (): SignatureData => {
  return cloneSignatureData(signatureData.value)
}

const setSignatureData = (data: SignatureData): void => {
  if (props.disabled) return

  signatureData.value = cloneSignatureData(data)
  redrawCanvas()
  saveToHistory()
}

const resize = (width?: number, height?: number): void => {
  const newWidth = width || canvasWidth.value
  const newHeight = height || canvasHeight.value

  // 保存当前内容
  const imageData = save({ format: 'png' })

  // 更新画布尺寸
  nextTick(() => {
    const canvas = canvasRef.value!
    canvas.width = newWidth
    canvas.height = newHeight

    // 恢复内容
    if (!isEmpty()) {
      fromDataURL(imageData)
    }

    updateSignatureData()
  })
}

// 初始化画布
const initCanvas = (): void => {
  const canvas = canvasRef.value!
  canvas.width = canvasWidth.value
  canvas.height = canvasHeight.value

  signatureData.value = createEmptySignatureData(canvasWidth.value, canvasHeight.value)

  // 初始化历史记录
  history.value = [cloneSignatureData(signatureData.value)]
  historyIndex.value = 0

  redrawCanvas()
}

// 监听尺寸变化
watch([() => props.width, () => props.height], () => {
  nextTick(() => {
    if (canvasRef.value) {
      resize()
    }
  })
})

// 生命周期
onMounted(() => {
  nextTick(() => {
    initCanvas()
  })
})

// 清理事件监听器
onUnmounted(() => {
  // 清理可能的事件监听器
})

// 暴露组件方法
defineExpose<SignatureMethods>({
  clear,
  undo,
  redo,
  save,
  isEmpty,
  fromDataURL,
  getSignatureData,
  setSignatureData,
  resize
})
</script>

<style scoped>
.electronic-signature {
  position: relative;
  display: inline-block;
}

.signature-placeholder {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #999;
  font-size: 14px;
  pointer-events: none;
  user-select: none;
  z-index: 1;
}

.signature-toolbar {
  margin-top: 8px;
  display: flex;
  gap: 8px;
}

.signature-toolbar button {
  padding: 6px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
}

.signature-toolbar button:hover:not(:disabled) {
  background: #f5f5f5;
  border-color: #999;
}

.signature-toolbar button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

canvas {
  touch-action: none;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
</style>

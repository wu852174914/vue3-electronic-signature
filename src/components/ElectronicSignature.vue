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
      <button @click="clear" :disabled="!canInteract">清除</button>
      <button @click="undo" :disabled="!canInteract || !canUndo">撤销</button>
      <button @click="redo" :disabled="!canInteract || !canRedo">重做</button>
    </div>

    <!-- 回放控制条 -->
    <div v-if="showReplayControls" class="replay-controls">
      <div class="replay-buttons">
        <button
          @click="replayState === 'playing' ? pause() : play()"
          :disabled="replayState === 'idle'"
          class="replay-btn play-pause-btn"
        >
          <span v-if="replayState === 'playing'">⏸️</span>
          <span v-else>▶️</span>
        </button>

        <button
          @click="stop()"
          :disabled="replayState === 'idle'"
          class="replay-btn stop-btn"
        >
          ⏹️
        </button>
      </div>

      <div class="replay-progress">
        <input
          type="range"
          min="0"
          :max="getTotalDuration()"
          :value="replayCurrentTime"
          @input="seek(Number(($event.target as HTMLInputElement).value))"
          class="progress-slider"
          :disabled="replayState === 'idle'"
        />
        <div class="time-display">
          <span>{{ formatTime(replayCurrentTime) }}</span>
          <span>/</span>
          <span>{{ formatTime(getTotalDuration()) }}</span>
        </div>
      </div>

      <div class="replay-speed">
        <label>速度:</label>
        <select
          @change="setSpeed(Number(($event.target as HTMLSelectElement).value))"
          class="speed-select"
        >
          <option value="0.5">0.5x</option>
          <option value="1" selected>1x</option>
          <option value="1.5">1.5x</option>
          <option value="2">2x</option>
        </select>
      </div>
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
  SignatureMethods,
  SignatureReplay,
  ReplayOptions,
  ReplayState
} from '../types'
import {
  drawSmoothPath,
  exportSignature,
  loadImageToCanvas,
  isSignatureEmpty,
  createEmptySignatureData,
  cloneSignatureData
} from '../utils/signature'
import {
  SignatureReplayController,
  createReplayData
} from '../utils/replay'

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
  // 回放事件
  'replay-start': []
  'replay-progress': [progress: number, currentTime: number]
  'replay-pause': []
  'replay-resume': []
  'replay-stop': []
  'replay-complete': []
  'replay-path-start': [pathIndex: number, path: SignaturePath]
  'replay-path-end': [pathIndex: number, path: SignaturePath]
  'replay-speed-change': [speed: number]
}>()

// 响应式引用
const canvasRef = ref<HTMLCanvasElement>()
const isDrawing = ref(false)
const currentPath = ref<SignaturePath | null>(null)
const signatureData = ref<SignatureData>(createEmptySignatureData(0, 0))
const history = ref<SignatureData[]>([])
const historyIndex = ref(-1)

// 回放相关状态
const replayController = ref<SignatureReplayController | null>(null)
const isReplayMode = ref(false)
const replayState = ref<ReplayState>('idle')
const replayProgress = ref(0)
const replayCurrentTime = ref(0)

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
  // 回放模式下不显示占位符
  if (isReplayMode.value) {
    return false
  }
  return props.placeholder && isSignatureEmpty(signatureData.value)
})

const canUndo = computed(() => historyIndex.value > 0)
const canRedo = computed(() => historyIndex.value < history.value.length - 1)

// 回放相关计算属性
const isReplayActive = computed(() => isReplayMode.value && replayController.value)
const canInteract = computed(() => !isReplayActive.value && !props.disabled)
const showReplayControls = computed(() => isReplayActive.value && props.replayOptions?.showControls !== false)

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
  if (!canInteract.value) return

  isDrawing.value = true

  // 记录笔画开始时间
  const startTime = performance.now()
  const pointWithTime = { ...point, time: startTime }

  currentPath.value = {
    points: [pointWithTime],
    strokeColor: props.strokeColor,
    strokeWidth: props.strokeWidth,
    startTime,
    endTime: startTime,
    duration: 0
  }

  emit('signature-start')
}

// 继续绘制
const continueDrawing = (point: SignaturePoint): void => {
  if (!isDrawing.value || !currentPath.value || !canInteract.value) return

  // 添加时间戳信息
  const currentTime = performance.now()
  const pointWithTime = { ...point, time: currentTime }

  currentPath.value.points.push(pointWithTime)

  // 更新路径的结束时间和持续时间
  if (currentPath.value.startTime) {
    currentPath.value.endTime = currentTime
    currentPath.value.duration = currentTime - currentPath.value.startTime
  }

  // 实时绘制 - 重新绘制整个画布以避免叠加
  redrawCanvas()

  // 更新签名数据
  updateSignatureData()
  emit('signature-drawing', signatureData.value)
}

// 结束绘制
const endDrawing = (): void => {
  if (!isDrawing.value || !currentPath.value) return

  isDrawing.value = false

  // 确保路径有正确的时间信息
  if (currentPath.value.points.length > 0) {
    const lastPoint = currentPath.value.points[currentPath.value.points.length - 1]
    if (lastPoint.time && currentPath.value.startTime) {
      currentPath.value.endTime = lastPoint.time
      currentPath.value.duration = lastPoint.time - currentPath.value.startTime
    }
  }

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

// 回放相关方法
const initReplayController = (): void => {
  console.log('初始化回放控制器')
  console.log('canvas引用是否存在:', !!canvasRef.value)

  if (!canvasRef.value) {
    console.error('canvas引用不存在，无法初始化回放控制器')
    return
  }

  if (replayController.value) {
    console.log('销毁现有回放控制器')
    replayController.value.destroy()
  }

  console.log('创建新的回放控制器')
  replayController.value = new SignatureReplayController(canvasRef.value)
  console.log('回放控制器创建成功:', !!replayController.value)

  // 绑定回放事件
  replayController.value.on('replay-start', () => {
    replayState.value = 'playing'
    emit('replay-start')
  })

  replayController.value.on('replay-progress', (progress: number, currentTime: number) => {
    replayProgress.value = progress
    replayCurrentTime.value = currentTime
    emit('replay-progress', progress, currentTime)
  })

  replayController.value.on('replay-pause', () => {
    replayState.value = 'paused'
    emit('replay-pause')
  })

  replayController.value.on('replay-resume', () => {
    replayState.value = 'playing'
    emit('replay-resume')
  })

  replayController.value.on('replay-stop', () => {
    replayState.value = 'stopped'
    emit('replay-stop')
  })

  replayController.value.on('replay-complete', () => {
    replayState.value = 'completed'
    emit('replay-complete')
  })

  replayController.value.on('replay-path-start', (pathIndex: number, path: SignaturePath) => {
    emit('replay-path-start', pathIndex, path)
  })

  replayController.value.on('replay-path-end', (pathIndex: number, path: SignaturePath) => {
    emit('replay-path-end', pathIndex, path)
  })

  replayController.value.on('replay-speed-change', (speed: number) => {
    emit('replay-speed-change', speed)
  })
}

const startReplay = (replayData: SignatureReplay, options?: ReplayOptions): void => {
  if (!replayController.value) {
    initReplayController()
  }

  if (replayController.value) {
    isReplayMode.value = true
    // 传递当前的绘制选项确保一致性
    const replayOptionsWithDrawOptions = {
      ...options,
      drawOptions: drawOptions.value
    }
    replayController.value.setReplayData(replayData, replayOptionsWithDrawOptions)
    console.log('startReplay调用，自动播放:', options?.autoPlay)

    if (options?.autoPlay === true) {
      replayController.value.play()
    }
  }
}

const setReplayMode = (enabled: boolean): void => {
  isReplayMode.value = enabled

  if (!enabled && replayController.value) {
    replayController.value.stop()
    redrawCanvas()
  }
}

const getReplayData = (): SignatureReplay | null => {
  if (isSignatureEmpty(signatureData.value)) {
    return null
  }

  return createReplayData(signatureData.value)
}

// 实现ReplayController接口的方法
const play = (): void => {
  console.log('play方法被调用')
  console.log('回放控制器是否存在:', !!replayController.value)

  if (!replayController.value) {
    console.log('回放控制器不存在，尝试初始化')
    initReplayController()
  }

  if (replayController.value) {
    console.log('调用回放控制器的play方法')
    replayController.value.play()
  } else {
    console.error('回放控制器初始化失败，无法播放')
  }
}

const pause = (): void => {
  replayController.value?.pause()
}

const stop = (): void => {
  replayController.value?.stop()
}

const seek = (time: number): void => {
  replayController.value?.seek(time)
}

const setSpeed = (speed: number): void => {
  replayController.value?.setSpeed(speed)
}

const getState = (): ReplayState => {
  return replayController.value?.getState() || 'idle'
}

const getCurrentTime = (): number => {
  return replayController.value?.getCurrentTime() || 0
}

const getTotalDuration = (): number => {
  return replayController.value?.getTotalDuration() || 0
}

const getProgress = (): number => {
  return replayController.value?.getProgress() || 0
}

// 工具函数
const formatTime = (milliseconds: number): string => {
  const seconds = Math.floor(milliseconds / 1000)
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

// 组件方法实现
const clear = (): void => {
  if (!canInteract.value) return

  signatureData.value = createEmptySignatureData(canvasWidth.value, canvasHeight.value)
  redrawCanvas()
  saveToHistory()
  emit('signature-clear')
}

const undo = (): void => {
  if (!canUndo.value || !canInteract.value) return

  historyIndex.value--
  signatureData.value = cloneSignatureData(history.value[historyIndex.value])
  redrawCanvas()
  emit('signature-undo', signatureData.value)
}

const redo = (): void => {
  if (!canRedo.value || !canInteract.value) return

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
  if (!canInteract.value) return

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
  if (!canInteract.value) return

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

// 监听回放模式变化
watch(() => props.replayMode, (newMode: boolean | undefined) => {
  if (newMode !== undefined) {
    setReplayMode(newMode)
  }
})

// 监听回放数据变化
watch(() => props.replayData, (newData: SignatureReplay | undefined) => {
  console.log('watch监听到回放数据变化:', newData)
  console.log('当前回放模式:', props.replayMode)
  console.log('回放控制器是否存在:', !!replayController.value)

  if (newData && props.replayMode) {
    // 确保回放控制器已初始化
    if (!replayController.value) {
      console.log('回放控制器未初始化，先初始化')
      initReplayController()
    }

    if (replayController.value) {
      // 只设置数据，不自动播放
      console.log('开始设置回放数据到控制器')
      // 传递当前的绘制选项确保一致性
      const replayOptionsWithDrawOptions = {
        ...props.replayOptions,
        drawOptions: drawOptions.value
      }
      replayController.value.setReplayData(newData, replayOptionsWithDrawOptions)
      console.log('回放数据已更新:', newData)
    } else {
      console.error('回放控制器初始化失败')
    }
  } else {
    if (!newData) console.log('回放数据为空，跳过设置')
    if (!props.replayMode) console.log('不在回放模式，跳过设置')
  }
}, { immediate: true })

// 生命周期
onMounted(() => {
  nextTick(() => {
    initCanvas()
    initReplayController()

    // 如果有初始回放数据，设置回放模式
    if (props.replayMode && props.replayData) {
      startReplay(props.replayData, props.replayOptions)
    }
  })
})

// 清理事件监听器
onUnmounted(() => {
  if (replayController.value) {
    replayController.value.destroy()
    replayController.value = null
  }
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
  resize,
  // 回放相关方法
  startReplay,
  getReplayData,
  setReplayMode,
  play,
  pause,
  stop,
  seek,
  setSpeed,
  getState,
  getCurrentTime,
  getTotalDuration,
  getProgress
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

/* 回放控制样式 */
.replay-controls {
  margin-top: 12px;
  padding: 12px;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 14px;
}

.replay-buttons {
  display: flex;
  gap: 8px;
}

.replay-btn {
  width: 36px;
  height: 36px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  transition: all 0.2s;
}

.replay-btn:hover:not(:disabled) {
  background: #f5f5f5;
  border-color: #999;
}

.replay-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.replay-progress {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.progress-slider {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: #e9ecef;
  outline: none;
  cursor: pointer;
}

.progress-slider::-webkit-slider-thumb {
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #007bff;
  cursor: pointer;
}

.progress-slider::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #007bff;
  cursor: pointer;
  border: none;
}

.time-display {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #666;
}

.replay-speed {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #666;
}

.speed-select {
  padding: 4px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: #fff;
  font-size: 12px;
  cursor: pointer;
}

.speed-select:focus {
  outline: none;
  border-color: #007bff;
}
</style>

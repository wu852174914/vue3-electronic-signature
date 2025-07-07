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
  ReplayState,
  PenStyle
} from '../types'
import {
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
import {
  createDrawOptionsFromPenStyle
} from '../utils/penStyles'

// 组件属性
interface ElectronicSignatureProps extends SignatureProps {
  showToolbar?: boolean
}

const props = withDefaults(defineProps<ElectronicSignatureProps>(), {
  width: '100%',
  height: 300,
  penStyle: 'ballpoint', // 全局默认使用适中笔迹
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
  realTimeMode: true,
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

// 实时渲染节流控制 - 基于Vue3-Signature-Pad的16ms节流
const lastDrawTime = ref(0)
const drawThrottle = 16 // 约60fps，与Vue3-Signature-Pad一致

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

const drawOptions = computed((): DrawOptions => {
  // 如果指定了笔迹样式，使用样式配置
  if (props.penStyle) {
    const styleOptions = createDrawOptionsFromPenStyle(props.penStyle, props.strokeColor)
    return {
      strokeColor: styleOptions.strokeColor,
      strokeWidth: props.strokeWidth || styleOptions.strokeWidth,
      smoothing: props.smoothing !== undefined ? props.smoothing : styleOptions.smoothing,
      pressure: {
        enabled: props.pressureSensitive !== undefined ? props.pressureSensitive : styleOptions.pressure.enabled,
        min: props.minStrokeWidth || styleOptions.pressure.min,
        max: props.maxStrokeWidth || styleOptions.pressure.max
      },
      lineCap: styleOptions.lineCap,
      lineJoin: styleOptions.lineJoin
    }
  }

  // 使用传统的props配置
  return {
    strokeColor: props.strokeColor || '#000000',
    strokeWidth: props.strokeWidth || 2,
    smoothing: props.smoothing !== undefined ? props.smoothing : true,
    pressure: {
      enabled: props.pressureSensitive || false,
      min: props.minStrokeWidth || 1,
      max: props.maxStrokeWidth || 4
    },
    lineCap: 'round',
    lineJoin: 'round'
  }
})

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
    penStyle: props.penStyle, // 保存笔迹样式
    startTime,
    endTime: startTime,
    duration: 0
  }

  emit('signature-start')
}

// 根据笔迹样式计算动态线宽
const calculateDynamicStrokeWidth = (point: SignaturePoint, prevPoint: SignaturePoint, penStyle: PenStyle, baseWidth: number): number => {
  switch (penStyle) {
    case 'pen':
      // 钢笔：恒定极细线宽
      return 1

    case 'brush':
      // 毛笔：极大的粗细变化
      if (prevPoint) {
        const distance = Math.sqrt(Math.pow(point.x - prevPoint.x, 2) + Math.pow(point.y - prevPoint.y, 2))
        const timeDiff = Math.max(1, (point.time || 0) - (prevPoint.time || 0))
        const speed = distance / timeDiff

        // 速度越快线条越细，速度越慢线条越粗
        const speedFactor = Math.max(0.1, Math.min(3, 100 / Math.max(speed, 1)))
        const pressure = point.pressure || 0.5
        const randomFactor = 0.8 + Math.random() * 0.4 // 增加随机性

        return Math.max(1, Math.min(20, baseWidth * speedFactor * (0.3 + pressure * 1.4) * randomFactor))
      }
      return baseWidth

    case 'marker':
      // 马克笔：超粗恒定线宽
      return 12

    case 'pencil':
      // 铅笔：中等粗细，有变化
      const pressure = point.pressure || 0.5
      const randomness = 0.9 + Math.random() * 0.2
      return baseWidth * (0.7 + pressure * 0.6) * randomness

    case 'ballpoint':
      // 圆珠笔：细线条，轻微变化
      const ballpointPressure = point.pressure || 0.5
      return baseWidth * (0.8 + ballpointPressure * 0.4)

    case 'elegant':
      // 优雅笔：基于速度和压力的动态变化，实现由粗到细的渐变
      const elegantPressure = point.pressure || 0.5

      // 计算速度因子（基于与前一个点的距离和时间差）
      let speedFactor = 1.0
      if (prevPoint) {
        const distance = Math.sqrt(Math.pow(point.x - prevPoint.x, 2) + Math.pow(point.y - prevPoint.y, 2))
        const timeDiff = Math.max(1, (point.time || 0) - (prevPoint.time || 0))
        const speed = distance / timeDiff
        // 速度越快线条越细，速度越慢线条越粗
        speedFactor = Math.max(0.3, Math.min(2.0, 50 / Math.max(speed, 1)))
      }

      // 结合压力和速度，创造优美的渐变效果
      const dynamicFactor = elegantPressure * speedFactor
      return baseWidth * (0.4 + dynamicFactor * 1.6)

    default:
      return baseWidth
  }
}

// 根据笔迹样式绘制线段
const drawStyledStroke = (ctx: CanvasRenderingContext2D, points: SignaturePoint[], penStyle: PenStyle, isRealTime = false): void => {
  if (points.length < 2) return

  ctx.strokeStyle = currentPath.value?.strokeColor || drawOptions.value.strokeColor
  ctx.lineCap = drawOptions.value.lineCap || 'round'
  ctx.lineJoin = drawOptions.value.lineJoin || 'round'

  switch (penStyle) {
    case 'pen':
      // 钢笔：极细锐利线条，商务风格
      ctx.lineWidth = 1
      ctx.lineCap = 'butt'
      ctx.lineJoin = 'miter'
      ctx.beginPath()
      ctx.moveTo(points[0].x, points[0].y)

      // 使用高精度平滑曲线
      if (points.length >= 3) {
        for (let i = 1; i < points.length - 1; i++) {
          const controlPoint = getControlPointForDrawing(points[i], points[i - 1], points[i + 1])
          ctx.quadraticCurveTo(controlPoint.x, controlPoint.y, points[i].x, points[i].y)
        }
        ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y)
      } else {
        for (let i = 1; i < points.length; i++) {
          ctx.lineTo(points[i].x, points[i].y)
        }
      }
      ctx.stroke()
      break

    case 'brush':
      // 毛笔：极大粗细变化，传统书法效果
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'

      for (let i = 1; i < points.length; i++) {
        const currentPoint = points[i]
        const prevPoint = points[i - 1]
        const lineWidth = calculateDynamicStrokeWidth(currentPoint, prevPoint, penStyle, drawOptions.value.strokeWidth)

        // 创建渐变效果
        const gradient = ctx.createLinearGradient(prevPoint.x, prevPoint.y, currentPoint.x, currentPoint.y)
        gradient.addColorStop(0, ctx.strokeStyle as string)
        gradient.addColorStop(1, ctx.strokeStyle as string)

        ctx.lineWidth = lineWidth
        ctx.beginPath()
        ctx.moveTo(prevPoint.x, prevPoint.y)
        ctx.lineTo(currentPoint.x, currentPoint.y)
        ctx.stroke()

        // 添加墨迹扩散效果
        if (lineWidth > 8 && Math.random() > 0.6) {
          ctx.globalAlpha = 0.2
          ctx.beginPath()
          ctx.arc(currentPoint.x, currentPoint.y, lineWidth * 0.3, 0, Math.PI * 2)
          ctx.fill()
          ctx.globalAlpha = 1.0
        }
      }
      break

    case 'marker':
      // 马克笔：超粗荧光笔效果
      ctx.globalAlpha = 0.7
      ctx.lineWidth = 12
      ctx.lineCap = 'square'
      ctx.lineJoin = 'bevel'

      // 绘制主线条
      ctx.beginPath()
      ctx.moveTo(points[0].x, points[0].y)
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y)
      }
      ctx.stroke()

      // 添加荧光效果
      ctx.globalAlpha = 0.3
      ctx.lineWidth = 16
      ctx.beginPath()
      ctx.moveTo(points[0].x, points[0].y)
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y)
      }
      ctx.stroke()

      ctx.globalAlpha = 1.0
      break

    case 'pencil':
      // 铅笔：粗糙纹理，素描效果
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'

      for (let i = 1; i < points.length; i++) {
        const currentPoint = points[i]
        const prevPoint = points[i - 1]
        const lineWidth = calculateDynamicStrokeWidth(currentPoint, prevPoint, penStyle, drawOptions.value.strokeWidth)

        // 主线条
        ctx.lineWidth = lineWidth
        ctx.globalAlpha = 0.8
        ctx.beginPath()
        ctx.moveTo(prevPoint.x, prevPoint.y)
        ctx.lineTo(currentPoint.x, currentPoint.y)
        ctx.stroke()

        // 添加多层纹理效果
        for (let j = 0; j < 3; j++) {
          if (Math.random() > 0.5) {
            ctx.globalAlpha = 0.2
            ctx.lineWidth = lineWidth * 0.3
            const offsetX = (Math.random() - 0.5) * 2
            const offsetY = (Math.random() - 0.5) * 2
            ctx.beginPath()
            ctx.moveTo(prevPoint.x + offsetX, prevPoint.y + offsetY)
            ctx.lineTo(currentPoint.x + offsetX, currentPoint.y + offsetY)
            ctx.stroke()
          }
        }

        // 添加石墨颗粒效果
        if (Math.random() > 0.8) {
          ctx.globalAlpha = 0.4
          for (let k = 0; k < 5; k++) {
            ctx.beginPath()
            ctx.arc(
              currentPoint.x + (Math.random() - 0.5) * 3,
              currentPoint.y + (Math.random() - 0.5) * 3,
              Math.random() * 0.8,
              0,
              Math.PI * 2
            )
            ctx.fill()
          }
        }
      }
      ctx.globalAlpha = 1.0
      break

    case 'ballpoint':
      // 圆珠笔：细线条，断续效果
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'

      for (let i = 1; i < points.length; i++) {
        const currentPoint = points[i]
        const prevPoint = points[i - 1]
        const lineWidth = calculateDynamicStrokeWidth(currentPoint, prevPoint, penStyle, drawOptions.value.strokeWidth)

        // 模拟圆珠笔的断续效果
        if (Math.random() > 0.1) { // 90%的概率绘制
          ctx.lineWidth = lineWidth
          ctx.globalAlpha = Math.random() > 0.2 ? 1.0 : 0.7 // 偶尔变淡
          ctx.beginPath()

          if (drawOptions.value.smoothing && i < points.length - 1) {
            const nextPoint = points[i + 1]
            const controlPoint = getControlPointForDrawing(currentPoint, prevPoint, nextPoint)
            ctx.moveTo(prevPoint.x, prevPoint.y)
            ctx.quadraticCurveTo(controlPoint.x, controlPoint.y, currentPoint.x, currentPoint.y)
          } else {
            ctx.moveTo(prevPoint.x, prevPoint.y)
            ctx.lineTo(currentPoint.x, currentPoint.y)
          }
          ctx.stroke()
        }

        // 移除墨水聚集点 - 基于用户反馈，适中笔迹不需要黑色圆圈
        // 保持线条的简洁和清晰
      }
      ctx.globalAlpha = 1.0
      break

    case 'elegant':
      // 优雅笔：平滑渐变，由粗到细的连笔之美
      drawElegantStroke(ctx, points, isRealTime)
      break
  }
}

// 智能实时绘制 - 基于Context7技术，避免毛笔闪烁问题
const drawRealTimeConsistentPath = (): void => {
  if (!currentPath.value || currentPath.value.points.length < 2) return

  const ctx = getContext()
  if (!ctx) return

  const penStyle = currentPath.value.penStyle || props.penStyle || 'pen'

  // 特殊笔迹样式处理：避免闪烁，只绘制新增部分
  if (penStyle === 'brush') {
    drawStableBrushIncrement()
    return
  }

  // 圆珠笔样式特殊处理：避免闪烁，使用稳定增量绘制
  if (penStyle === 'ballpoint') {
    drawStableBallpointIncrement()
    return
  }

  // 其他笔迹样式：使用完全重绘确保一致性
  // 清除画布并重绘所有路径
  ctx.clearRect(0, 0, canvasWidth.value, canvasHeight.value)

  // 重绘所有已完成的路径
  for (const path of signatureData.value.paths) {
    if (path !== currentPath.value) {
      drawPathWithConsistentAlgorithm(ctx, path)
    }
  }

  // 绘制当前正在绘制的路径（使用完整算法）
  if (currentPath.value.points.length >= 2) {
    drawPathWithConsistentAlgorithm(ctx, currentPath.value)
  }
}

// 稳定的毛笔增量绘制 - 避免闪烁，已书写笔迹不变
const drawStableBrushIncrement = (): void => {
  if (!currentPath.value || currentPath.value.points.length < 2) return

  const ctx = getContext()
  if (!ctx) return

  const points = currentPath.value.points
  const pointCount = points.length

  // 只绘制最新的线段，避免重绘已有笔迹
  if (pointCount >= 2) {
    const recentPoints = points.slice(-3) // 取最近3个点确保连续性
    if (recentPoints.length >= 2) {
      drawStyledStroke(ctx, recentPoints, 'brush', true) // 实时绘制
    }
  }
}

// 稳定的圆珠笔增量绘制 - 基于Vue3-Signature-Pad技术，避免闪烁
const drawStableBallpointIncrement = (): void => {
  if (!currentPath.value || currentPath.value.points.length < 2) return

  const ctx = getContext()
  if (!ctx) return

  const points = currentPath.value.points
  const pointCount = points.length

  // 只绘制最新的线段，避免重绘已有笔迹
  if (pointCount >= 2) {
    const recentPoints = points.slice(-3) // 取最近3个点确保连续性
    if (recentPoints.length >= 2) {
      drawStyledStroke(ctx, recentPoints, 'ballpoint', true) // 实时绘制
    }
  }
}

// 高效的增量绘制 - 只绘制新增的线段
const drawIncrementalPath = (): void => {
  if (!currentPath.value || currentPath.value.points.length < 2) return

  const ctx = getContext()
  if (!ctx) return

  const points = currentPath.value.points
  const pointCount = points.length
  const penStyle = props.penStyle || 'pen'

  if (pointCount === 2) {
    // 第一条线段
    drawStyledStroke(ctx, points, penStyle, true) // 实时绘制
  } else if (pointCount >= 3) {
    // 只绘制最新的线段
    const recentPoints = points.slice(-3)
    drawStyledStroke(ctx, recentPoints, penStyle, true) // 实时绘制
  }
}

// 绘制优雅笔迹 - 基于Fabric.js和Vue3-Signature-Pad的速度压力感应技术
const drawElegantStroke = (ctx: CanvasRenderingContext2D, points: SignaturePoint[], isRealTime = false): void => {
  if (points.length < 2) return

  ctx.strokeStyle = currentPath.value?.strokeColor || drawOptions.value.strokeColor
  ctx.fillStyle = currentPath.value?.strokeColor || drawOptions.value.strokeColor
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.globalCompositeOperation = 'source-over'

  // 基于Fabric.js PencilBrush的速度感应算法
  // 预处理点数据，计算速度和压力
  const processedPoints = preprocessPointsForVelocity(points, drawOptions.value.strokeWidth)

  // 使用Fabric.js的平滑路径技术绘制连续渐变
  drawVelocityBasedPath(ctx, processedPoints)

  // 连接点只在最终绘制时添加，实时绘制时不添加避免闪烁
  if (!isRealTime) {
    addVelocityBasedConnections(ctx, processedPoints)
  }
}

// 预处理点数据，计算速度和动态线宽 - 基于Vue3-Signature-Pad算法
const preprocessPointsForVelocity = (points: SignaturePoint[], baseWidth: number): Array<SignaturePoint & {
  velocity: number,
  dynamicWidth: number,
  smoothedWidth: number
}> => {
  const processedPoints: Array<SignaturePoint & {
    velocity: number,
    dynamicWidth: number,
    smoothedWidth: number
  }> = []

  for (let i = 0; i < points.length; i++) {
    const point = points[i]
    let velocity = 0
    let dynamicWidth = baseWidth

    if (i > 0) {
      const prevPoint = points[i - 1]

      // 计算速度 - 基于Vue3-Signature-Pad的throttle算法
      const distance = Math.sqrt(
        Math.pow(point.x - prevPoint.x, 2) +
        Math.pow(point.y - prevPoint.y, 2)
      )
      const timeDiff = Math.max(1, (point.time || 0) - (prevPoint.time || 0))
      velocity = distance / timeDiff

      // 基于Fabric.js的动态线宽算法
      const pressure = point.pressure || 0.5
      const velocityFactor = Math.max(0.2, Math.min(3.0, 100 / Math.max(velocity, 1)))

      // 优雅笔的核心算法：速度越快线条越细，压力越大线条越粗
      dynamicWidth = baseWidth * (0.3 + pressure * velocityFactor * 1.4)
    }

    // 平滑线宽变化 - 避免突变
    let smoothedWidth = dynamicWidth
    if (i > 0) {
      const prevWidth = processedPoints[i - 1].smoothedWidth
      smoothedWidth = prevWidth + (dynamicWidth - prevWidth) * 0.3 // 平滑因子
    }

    processedPoints.push({
      ...point,
      velocity,
      dynamicWidth,
      smoothedWidth: Math.max(0.5, Math.min(baseWidth * 3, smoothedWidth))
    })
  }

  return processedPoints
}

// 基于速度的路径绘制 - 使用Fabric.js的平滑算法
const drawVelocityBasedPath = (
  ctx: CanvasRenderingContext2D,
  processedPoints: Array<SignaturePoint & { velocity: number, dynamicWidth: number, smoothedWidth: number }>
): void => {
  if (processedPoints.length < 2) return

  // 基于Fabric.js的convertPointsToSVGPath技术
  // 创建平滑的连续路径
  for (let i = 1; i < processedPoints.length; i++) {
    const currentPoint = processedPoints[i]
    const prevPoint = processedPoints[i - 1]

    // 绘制渐变线段
    drawVelocitySegment(ctx, prevPoint, currentPoint, prevPoint.smoothedWidth, currentPoint.smoothedWidth)
  }
}

// 绘制基于速度的单个线段 - 实现由粗到细的渐变
const drawVelocitySegment = (
  ctx: CanvasRenderingContext2D,
  startPoint: SignaturePoint & { smoothedWidth: number },
  endPoint: SignaturePoint & { smoothedWidth: number },
  startWidth: number,
  endWidth: number
): void => {
  // 基于Fabric.js的PencilBrush算法
  // 创建平滑的渐变路径
  const distance = Math.sqrt(
    Math.pow(endPoint.x - startPoint.x, 2) +
    Math.pow(endPoint.y - startPoint.y, 2)
  )

  // 根据距离决定分段数，确保平滑度
  const segments = Math.max(2, Math.min(10, Math.floor(distance / 3)))

  ctx.beginPath()

  // 创建渐变路径的边界点
  const pathPoints: Array<{x: number, y: number}> = []

  for (let i = 0; i <= segments; i++) {
    const t = i / segments

    // 使用三次贝塞尔插值实现平滑过渡
    const smoothT = smoothStep(t)

    // 插值位置
    const x = startPoint.x + (endPoint.x - startPoint.x) * smoothT
    const y = startPoint.y + (endPoint.y - startPoint.y) * smoothT

    // 插值宽度 - 关键：实现由粗到细的渐变
    const width = startWidth + (endWidth - startWidth) * smoothT

    // 计算垂直方向
    const dx = endPoint.x - startPoint.x
    const dy = endPoint.y - startPoint.y
    const length = Math.sqrt(dx * dx + dy * dy)

    if (length > 0) {
      const perpX = -dy / length * width / 2
      const perpY = dx / length * width / 2

      // 添加上下边界点
      if (i === 0) {
        ctx.moveTo(x + perpX, y + perpY)
      } else {
        ctx.lineTo(x + perpX, y + perpY)
      }

      pathPoints.push({ x: x - perpX, y: y - perpY })
    }
  }

  // 绘制下边界（反向）
  for (let i = pathPoints.length - 1; i >= 0; i--) {
    ctx.lineTo(pathPoints[i].x, pathPoints[i].y)
  }

  ctx.closePath()
  ctx.fill()
}

// 基于速度变化的智能连接 - 优化连笔效果，增强连笔的明显性
const addVelocityBasedConnections = (
  ctx: CanvasRenderingContext2D,
  processedPoints: Array<SignaturePoint & { velocity: number, dynamicWidth: number, smoothedWidth: number }>
): void => {
  // 基于Fabric.js的智能连接算法，增强连笔效果
  for (let i = 1; i < processedPoints.length - 1; i++) {
    const prevPoint = processedPoints[i - 1]
    const currentPoint = processedPoints[i]
    const nextPoint = processedPoints[i + 1]

    // 计算速度变化率
    const velocityChange = Math.abs(currentPoint.velocity - prevPoint.velocity)
    const avgVelocity = (currentPoint.velocity + prevPoint.velocity) / 2

    // 计算角度变化
    const angle1 = Math.atan2(currentPoint.y - prevPoint.y, currentPoint.x - prevPoint.x)
    const angle2 = Math.atan2(nextPoint.y - currentPoint.y, nextPoint.x - currentPoint.x)
    let angleDiff = Math.abs(angle2 - angle1)

    // 处理角度跨越π的情况
    if (angleDiff > Math.PI) {
      angleDiff = 2 * Math.PI - angleDiff
    }

    // 更明显的连笔效果：降低阈值，增加连接点
    const shouldConnect = velocityChange > avgVelocity * 0.3 || angleDiff > 0.15 // 降低阈值

    if (shouldConnect) {
      // 增强连接效果：使用渐变连接
      const connectionRadius = currentPoint.smoothedWidth * 0.6 // 增大连接半径

      // 创建径向渐变效果
      const gradient = ctx.createRadialGradient(
        currentPoint.x, currentPoint.y, 0,
        currentPoint.x, currentPoint.y, connectionRadius
      )
      gradient.addColorStop(0, ctx.fillStyle as string)
      gradient.addColorStop(1, 'transparent')

      const originalFillStyle = ctx.fillStyle
      ctx.fillStyle = gradient

      ctx.beginPath()
      ctx.arc(currentPoint.x, currentPoint.y, connectionRadius, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = originalFillStyle
    }

    // 额外的连笔增强：在所有转折点添加小的连接点
    if (angleDiff > 0.05) { // 很小的角度变化也添加连接
      const smallConnectionRadius = currentPoint.smoothedWidth * 0.2

      ctx.beginPath()
      ctx.arc(currentPoint.x, currentPoint.y, smallConnectionRadius, 0, Math.PI * 2)
      ctx.fill()
    }
  }
}

// 平滑插值函数
const smoothStep = (t: number): number => {
  // 使用三次贝塞尔曲线进行平滑插值
  return t * t * (3 - 2 * t)
}

// 获取控制点（与回放算法一致）
const getControlPointForDrawing = (current: SignaturePoint, previous: SignaturePoint, next: SignaturePoint): SignaturePoint => {
  const smoothing = 0.2
  const opposedLine = {
    length: Math.sqrt(Math.pow(next.x - previous.x, 2) + Math.pow(next.y - previous.y, 2)),
    angle: Math.atan2(next.y - previous.y, next.x - previous.x)
  }

  const angle = opposedLine.angle + Math.PI
  const length = opposedLine.length * smoothing

  return {
    x: current.x + Math.cos(angle) * length,
    y: current.y + Math.sin(angle) * length,
    time: current.time || 0
  }
}


// 使用与增量绘制一致的算法绘制完整路径
const drawPathWithConsistentAlgorithm = (ctx: CanvasRenderingContext2D, path: SignaturePath): void => {
  if (path.points.length < 2) return

  // 优先使用路径中保存的笔迹样式，如果没有则使用当前组件的样式
  const penStyle = path.penStyle || props.penStyle || 'pen'

  // 临时设置当前路径以便drawStyledStroke可以访问颜色
  const originalPath = currentPath.value
  currentPath.value = path

  // 使用相同的样式绘制算法
  drawStyledStroke(ctx, path.points, penStyle)

  // 恢复原始路径
  currentPath.value = originalPath
}

// 继续绘制
const continueDrawing = (point: SignaturePoint): void => {
  if (!isDrawing.value || !currentPath.value || !canInteract.value) return

  // 基于Vue3-Signature-Pad的16ms节流机制
  const currentTime = performance.now()
  if (currentTime - lastDrawTime.value < drawThrottle) {
    return
  }
  lastDrawTime.value = currentTime

  // 添加时间戳信息
  const pointWithTime = { ...point, time: currentTime }

  currentPath.value.points.push(pointWithTime)

  // 更新路径的结束时间和持续时间
  if (currentPath.value.startTime) {
    currentPath.value.endTime = currentTime
    currentPath.value.duration = currentTime - currentPath.value.startTime
  }

  // 实时渲染模式：使用与最终效果一致的算法
  if (props.realTimeMode) {
    drawRealTimeConsistentPath()
  } else {
    // 传统增量绘制
    drawIncrementalPath()
  }

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

  // 结束绘制后重绘画布，确保最终效果与回放一致
  redrawCanvas()

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

  // 绘制所有路径 - 使用与增量绘制相同的算法
  signatureData.value.paths.forEach((path: SignaturePath) => {
    if (path.points.length > 0) {
      drawPathWithConsistentAlgorithm(ctx, path)
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
    // 传递当前的绘制选项和笔迹样式确保一致性
    const replayOptionsWithDrawOptions = {
      ...options,
      drawOptions: drawOptions.value,
      penStyle: props.penStyle
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
      // 传递当前的绘制选项和笔迹样式确保一致性
      const replayOptionsWithDrawOptions = {
        ...props.replayOptions,
        drawOptions: drawOptions.value,
        penStyle: props.penStyle
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

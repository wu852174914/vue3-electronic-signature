import type {
  SignatureReplay,
  SignaturePath,
  SignaturePoint,
  SignatureData,
  ReplayState,
  ReplayOptions,
  ReplayController,
  PenStyle
} from '../types'

/**
 * 签名回放控制器
 */
export class SignatureReplayController implements ReplayController {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private replayData: SignatureReplay | null = null
  private state: ReplayState = 'idle'
  private currentTime = 0
  private speed = 1
  private animationId: number | null = null
  private startTimestamp = 0
  private pausedTime = 0
  private options: ReplayOptions = {}
  
  // 事件回调
  private eventCallbacks: Map<string, Function[]> = new Map()

  // 性能优化相关
  private offscreenCanvas: HTMLCanvasElement | OffscreenCanvas | null = null
  private offscreenCtx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null = null
  private lastFrameImageBitmap: ImageBitmap | null = null
  private renderThrottle: number = 0
  private isRendering: boolean = false

  // 确定性随机数生成器（解决毛笔闪烁问题）
  private seededRandom: (seed: number) => number

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')!
    this.initializeOffscreenCanvas()

    // 初始化确定性随机数生成器（基于Context7的RandomColor库思路）
    this.seededRandom = this.createSeededRandom()
  }

  /**
   * 创建确定性随机数生成器（解决毛笔等笔迹的闪烁问题）
   * 基于简单的线性同余生成器（LCG）算法
   */
  private createSeededRandom(): (seed: number) => number {
    return (seed: number): number => {
      // 使用LCG算法：(a * seed + c) % m
      // 参数来自Numerical Recipes，保证良好的随机性
      const a = 1664525
      const c = 1013904223
      const m = Math.pow(2, 32)

      const result = (a * seed + c) % m
      return result / m // 归一化到[0, 1)
    }
  }

  /**
   * 初始化离屏画布用于性能优化
   */
  private initializeOffscreenCanvas(): void {
    try {
      // 尝试使用OffscreenCanvas（更高性能）
      if (typeof OffscreenCanvas !== 'undefined') {
        this.offscreenCanvas = new OffscreenCanvas(this.canvas.width, this.canvas.height)
        this.offscreenCtx = this.offscreenCanvas.getContext('2d')!
      } else {
        // 回退到普通Canvas
        this.offscreenCanvas = document.createElement('canvas')
        this.offscreenCanvas.width = this.canvas.width
        this.offscreenCanvas.height = this.canvas.height
        this.offscreenCtx = this.offscreenCanvas.getContext('2d')!
      }

      // 优化Canvas设置
      if (this.offscreenCtx) {
        // 设置高质量渲染
        this.offscreenCtx.imageSmoothingEnabled = true
        this.offscreenCtx.imageSmoothingQuality = 'high'

        // 优化文本渲染（如果支持）
        try {
          (this.offscreenCtx as any).textRenderingOptimization = 'optimizeSpeed'
        } catch (e) {
          // 忽略不支持的属性
        }
      }
    } catch (error) {
      console.warn('Failed to initialize optimized offscreen canvas:', error)
      // 最基本的回退方案
      this.offscreenCanvas = document.createElement('canvas')
      this.offscreenCanvas.width = this.canvas.width
      this.offscreenCanvas.height = this.canvas.height
      this.offscreenCtx = this.offscreenCanvas.getContext('2d')!
    }
  }

  /**
   * 设置回放数据
   */
  setReplayData(data: SignatureReplay, options: ReplayOptions = {}): void {
    console.log('设置回放数据:', data)
    console.log('回放选项:', options)

    this.replayData = data
    this.options = { ...options }
    this.speed = options.speed || data.speed || 1
    this.currentTime = options.startTime || 0
    this.state = 'idle'

    // 重置优化状态
    this.resetOptimizationState()

    console.log('回放数据设置完成，路径数量:', data.paths.length)
    console.log('总时长:', data.totalDuration)
  }

  /**
   * 重置优化状态
   */
  private resetOptimizationState(): void {
    // 重新初始化离屏画布
    if (this.offscreenCanvas) {
      this.offscreenCanvas.width = this.canvas.width
      this.offscreenCanvas.height = this.canvas.height
    }
  }

  /**
   * 开始播放
   */
  play(): void {
    console.log('播放方法调用，回放数据:', this.replayData)
    console.log('当前状态:', this.state)

    if (!this.replayData) {
      console.error('没有回放数据，无法播放')
      return
    }

    if (this.replayData.totalDuration <= 0) {
      console.error('回放数据总时长为0，无法播放')
      return
    }

    if (this.replayData.paths.length === 0) {
      console.error('回放数据没有路径，无法播放')
      return
    }

    if (this.state === 'playing') {
      console.log('已在播放中，忽略')
      return
    }

    if (this.state === 'paused') {
      // 从暂停状态恢复
      console.log('从暂停状态恢复播放')
      this.state = 'playing'
      this.startTimestamp = performance.now() - this.pausedTime
      this.emit('replay-resume')
    } else {
      // 开始新的播放
      console.log('开始新的播放')
      this.state = 'playing'
      this.startTimestamp = performance.now()
      this.pausedTime = 0
      this.currentTime = this.options.startTime || 0
      this.clearCanvas()
      this.emit('replay-start')
    }

    this.animate()
  }

  /**
   * 暂停播放
   */
  pause(): void {
    if (this.state !== 'playing') return

    this.state = 'paused'
    this.pausedTime = performance.now() - this.startTimestamp
    
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
      this.animationId = null
    }

    this.emit('replay-pause')
  }

  /**
   * 停止播放
   */
  stop(): void {
    this.state = 'stopped'
    this.currentTime = 0
    this.pausedTime = 0

    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
      this.animationId = null
    }

    this.clearCanvas()
    this.emit('replay-stop')
  }

  /**
   * 跳转到指定时间
   */
  seek(time: number): void {
    if (!this.replayData) return

    const maxTime = this.options.endTime || this.replayData.totalDuration
    this.currentTime = Math.max(0, Math.min(time, maxTime))

    // 跳转时重新渲染

    if (this.state === 'playing') {
      this.startTimestamp = performance.now() - this.currentTime / this.speed
    } else {
      this.pausedTime = this.currentTime / this.speed
    }

    this.renderFrame(this.currentTime)
  }

  /**
   * 设置播放速度
   */
  setSpeed(speed: number): void {
    const wasPlaying = this.state === 'playing'
    
    if (wasPlaying) {
      this.pause()
    }

    this.speed = Math.max(0.1, Math.min(5, speed))
    this.emit('replay-speed-change', this.speed)

    if (wasPlaying) {
      this.play()
    }
  }

  /**
   * 获取当前状态
   */
  getState(): ReplayState {
    return this.state
  }

  /**
   * 获取当前时间
   */
  getCurrentTime(): number {
    return this.currentTime
  }

  /**
   * 获取总时长
   */
  getTotalDuration(): number {
    return this.replayData?.totalDuration || 0
  }

  /**
   * 获取当前进度（0-1）
   */
  getProgress(): number {
    const total = this.getTotalDuration()
    return total > 0 ? this.currentTime / total : 0
  }

  /**
   * 动画循环
   */
  private animate(): void {
    if (this.state !== 'playing' || !this.replayData) return

    const now = performance.now()
    this.currentTime = (now - this.startTimestamp) * this.speed

    const maxTime = this.options.endTime || this.replayData.totalDuration

    if (this.currentTime >= maxTime) {
      // 播放完成
      this.currentTime = maxTime
      this.state = 'completed'
      this.renderFrame(this.currentTime)
      this.emit('replay-complete')

      // 检查是否需要循环播放
      if (this.options.loop) {
        setTimeout(() => {
          this.currentTime = this.options.startTime || 0
          this.play()
        }, 500)
      }
      return
    }

    this.renderFrame(this.currentTime)
    this.emit('replay-progress', this.getProgress(), this.currentTime)

    this.animationId = requestAnimationFrame(() => this.animate())
  }

  /**
   * 渲染指定时间的帧 - 高性能优化版本
   */
  private renderFrame(time: number): void {
    if (!this.replayData || !this.offscreenCanvas || !this.offscreenCtx) return

    // 渲染节流：避免过于频繁的重绘
    const now = performance.now()
    if (now - this.renderThrottle < 16) { // 限制在60fps
      return
    }
    this.renderThrottle = now

    // 防止重复渲染
    if (this.isRendering) return
    this.isRendering = true

    try {
      // 在离屏画布上绘制完整帧
      this.renderToOffscreenCanvas(time)

      // 使用高效的图像传输方法
      this.transferToMainCanvasSync()
    } finally {
      this.isRendering = false
    }
  }

  /**
   * 高效地将离屏画布内容传输到主画布（同步版本）
   */
  private transferToMainCanvasSync(): void {
    if (!this.offscreenCanvas) return

    try {
      // 使用优化的Canvas设置
      this.ctx.imageSmoothingEnabled = false // 禁用平滑以提高性能

      // 避免clearRect，直接覆盖绘制
      this.ctx.globalCompositeOperation = 'copy' // 直接替换像素
      this.ctx.drawImage(this.offscreenCanvas as HTMLCanvasElement, 0, 0)
      this.ctx.globalCompositeOperation = 'source-over' // 恢复默认混合模式

      // 恢复平滑设置
      this.ctx.imageSmoothingEnabled = true
    } catch (error) {
      // 如果优化方法失败，使用传统方法
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
      this.ctx.drawImage(this.offscreenCanvas as HTMLCanvasElement, 0, 0)
    }
  }

  /**
   * 在离屏画布上渲染完整帧
   */
  private renderToOffscreenCanvas(time: number): void {
    if (!this.replayData || !this.offscreenCtx) return

    // 高效清除离屏画布
    const canvas = this.offscreenCanvas!
    const ctx = this.offscreenCtx!

    // 使用最快的清除方法
    ctx.globalCompositeOperation = 'copy'
    ctx.fillStyle = 'transparent'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.globalCompositeOperation = 'source-over'

    // 设置背景（如果需要）
    // 注意：这里暂时注释掉背景设置，因为ReplayOptions中没有backgroundColor属性
    // if (this.options.backgroundColor) {
    //   this.offscreenCtx.fillStyle = this.options.backgroundColor
    //   this.offscreenCtx.fillRect(0, 0, this.offscreenCanvas!.width, this.offscreenCanvas!.height)
    // }

    let hasActiveStroke = false

    for (let i = 0; i < this.replayData.paths.length; i++) {
      const path = this.replayData.paths[i]
      const pathStartTime = path.startTime || 0
      const pathEndTime = path.endTime || pathStartTime + (path.duration || 0)

      if (time < pathStartTime) {
        // 还没到这个笔画的时间
        break
      }

      if (time >= pathEndTime) {
        // 这个笔画已经完成，完整绘制
        this.drawCompletePathToOffscreen(path)

        // 检查是否刚刚完成这个笔画
        if (!hasActiveStroke && Math.abs(time - pathEndTime) < 32) { // 约2帧的容差
          this.emit('replay-path-end', i, path)
        }
        continue
      }

      // 正在绘制这个笔画
      hasActiveStroke = true
      const pathProgress = Math.max(0, Math.min(1, (time - pathStartTime) / Math.max(pathEndTime - pathStartTime, 1)))

      // 检查是否刚开始这个笔画
      if (pathProgress > 0 && Math.abs(time - pathStartTime) < 32) { // 约2帧的容差
        this.emit('replay-path-start', i, path)
      }

      this.drawPartialPathToOffscreen(path, pathProgress)
      break
    }
  }






  /**
   * 获取指定时间内的所有点
   */
  private getPointsUpToTime(points: SignaturePoint[], pathStartTime: number, currentTime: number): SignaturePoint[] {
    const visiblePoints: SignaturePoint[] = []

    for (let i = 0; i < points.length; i++) {
      const point = points[i]
      const pointTime = pathStartTime + (point.relativeTime || i * 50) // 使用相对时间或估算时间

      if (pointTime <= currentTime) {
        visiblePoints.push(point)
      } else {
        // 如果当前时间在两个点之间，进行时间插值
        if (i > 0) {
          const prevPoint = points[i - 1]
          const prevPointTime = pathStartTime + (prevPoint.relativeTime || (i - 1) * 50)

          if (prevPointTime <= currentTime) {
            const timeProgress = (currentTime - prevPointTime) / (pointTime - prevPointTime)
            const interpolatedPoint: SignaturePoint = {
              x: prevPoint.x + (point.x - prevPoint.x) * timeProgress,
              y: prevPoint.y + (point.y - prevPoint.y) * timeProgress,
              time: currentTime,
              pressure: prevPoint.pressure ?
                prevPoint.pressure + (point.pressure || prevPoint.pressure - prevPoint.pressure) * timeProgress :
                point.pressure
            }
            visiblePoints.push(interpolatedPoint)
          }
        }
        break
      }
    }

    return visiblePoints
  }

  /**
   * 根据笔迹样式计算动态线宽（与录制时一致）
   */
  private calculateDynamicStrokeWidth(point: SignaturePoint, prevPoint: SignaturePoint, penStyle: PenStyle, baseWidth: number): number {
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
          // 使用确定性随机数（基于点的坐标和时间作为种子）
          const seed = Math.floor(point.x * 1000 + point.y * 1000 + (point.time || 0))
          const randomFactor = 0.8 + this.seededRandom(seed) * 0.4

          return Math.max(1, Math.min(20, baseWidth * speedFactor * (0.3 + pressure * 1.4) * randomFactor))
        }
        return baseWidth

      case 'marker':
        // 马克笔：超粗恒定线宽
        return 12

      case 'pencil':
        // 铅笔：中等粗细，有变化
        const pressure = point.pressure || 0.5
        // 使用确定性随机数
        const seed = Math.floor(point.x * 1000 + point.y * 1000 + (point.time || 0))
        const randomness = 0.9 + this.seededRandom(seed + 1) * 0.2
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

  /**
   * 根据笔迹样式绘制线段（与录制时完全一致）
   */
  private drawStyledStrokeForReplay(points: SignaturePoint[], penStyle: PenStyle, strokeColor: string, strokeWidth: number): void {
    if (points.length < 2) return

    this.ctx.strokeStyle = strokeColor

    switch (penStyle) {
      case 'pen':
        // 钢笔：极细锐利线条，商务风格
        this.ctx.lineWidth = 1
        this.ctx.lineCap = 'butt'
        this.ctx.lineJoin = 'miter'
        this.ctx.beginPath()
        this.ctx.moveTo(points[0].x, points[0].y)

        // 使用高精度平滑曲线
        if (points.length >= 3) {
          for (let i = 1; i < points.length - 1; i++) {
            const controlPoint = this.getControlPoint(points[i], points[i - 1], points[i + 1])
            this.ctx.quadraticCurveTo(controlPoint.x, controlPoint.y, points[i].x, points[i].y)
          }
          this.ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y)
        } else {
          for (let i = 1; i < points.length; i++) {
            this.ctx.lineTo(points[i].x, points[i].y)
          }
        }
        this.ctx.stroke()
        break

      case 'brush':
        // 毛笔：极大粗细变化，传统书法效果
        this.ctx.lineCap = 'round'
        this.ctx.lineJoin = 'round'

        for (let i = 1; i < points.length; i++) {
          const currentPoint = points[i]
          const prevPoint = points[i - 1]
          const lineWidth = this.calculateDynamicStrokeWidth(currentPoint, prevPoint, penStyle, strokeWidth)

          this.ctx.lineWidth = lineWidth
          this.ctx.beginPath()
          this.ctx.moveTo(prevPoint.x, prevPoint.y)
          this.ctx.lineTo(currentPoint.x, currentPoint.y)
          this.ctx.stroke()

          // 添加墨迹扩散效果（使用确定性随机数）
          const inkSeed = Math.floor(currentPoint.x * 100 + currentPoint.y * 100 + i)
          if (lineWidth > 8 && this.seededRandom(inkSeed) > 0.6) {
            this.ctx.globalAlpha = 0.2
            this.ctx.beginPath()
            this.ctx.arc(currentPoint.x, currentPoint.y, lineWidth * 0.3, 0, Math.PI * 2)
            this.ctx.fill()
            this.ctx.globalAlpha = 1.0
          }
        }
        break

      case 'marker':
        // 马克笔：超粗荧光笔效果
        this.ctx.globalAlpha = 0.7
        this.ctx.lineWidth = 12
        this.ctx.lineCap = 'square'
        this.ctx.lineJoin = 'bevel'

        // 绘制主线条
        this.ctx.beginPath()
        this.ctx.moveTo(points[0].x, points[0].y)
        for (let i = 1; i < points.length; i++) {
          this.ctx.lineTo(points[i].x, points[i].y)
        }
        this.ctx.stroke()

        // 添加荧光效果
        this.ctx.globalAlpha = 0.3
        this.ctx.lineWidth = 16
        this.ctx.beginPath()
        this.ctx.moveTo(points[0].x, points[0].y)
        for (let i = 1; i < points.length; i++) {
          this.ctx.lineTo(points[i].x, points[i].y)
        }
        this.ctx.stroke()

        this.ctx.globalAlpha = 1.0
        break

      case 'pencil':
        // 铅笔：粗糙纹理，素描效果
        this.ctx.lineCap = 'round'
        this.ctx.lineJoin = 'round'

        for (let i = 1; i < points.length; i++) {
          const currentPoint = points[i]
          const prevPoint = points[i - 1]
          const lineWidth = this.calculateDynamicStrokeWidth(currentPoint, prevPoint, penStyle, strokeWidth)

          // 主线条
          this.ctx.lineWidth = lineWidth
          this.ctx.globalAlpha = 0.8
          this.ctx.beginPath()
          this.ctx.moveTo(prevPoint.x, prevPoint.y)
          this.ctx.lineTo(currentPoint.x, currentPoint.y)
          this.ctx.stroke()

          // 添加多层纹理效果（使用确定性随机数）
          for (let j = 0; j < 3; j++) {
            const textureSeed = Math.floor(currentPoint.x * 10 + currentPoint.y * 10 + i * 10 + j)
            if (this.seededRandom(textureSeed) > 0.5) {
              this.ctx.globalAlpha = 0.2
              this.ctx.lineWidth = lineWidth * 0.3
              const offsetX = (this.seededRandom(textureSeed + 1) - 0.5) * 2
              const offsetY = (this.seededRandom(textureSeed + 2) - 0.5) * 2
              this.ctx.beginPath()
              this.ctx.moveTo(prevPoint.x + offsetX, prevPoint.y + offsetY)
              this.ctx.lineTo(currentPoint.x + offsetX, currentPoint.y + offsetY)
              this.ctx.stroke()
            }
          }

          // 添加石墨颗粒效果（使用确定性随机数）
          const particleSeed = Math.floor(currentPoint.x * 5 + currentPoint.y * 5 + i * 5)
          if (this.seededRandom(particleSeed) > 0.8) {
            this.ctx.globalAlpha = 0.4
            for (let k = 0; k < 5; k++) {
              const kSeed = particleSeed + k * 10
              this.ctx.beginPath()
              this.ctx.arc(
                currentPoint.x + (this.seededRandom(kSeed + 1) - 0.5) * 3,
                currentPoint.y + (this.seededRandom(kSeed + 2) - 0.5) * 3,
                this.seededRandom(kSeed + 3) * 0.8,
                0,
                Math.PI * 2
              )
              this.ctx.fill()
            }
          }
        }
        this.ctx.globalAlpha = 1.0
        break

      case 'ballpoint':
        // 圆珠笔：细线条，断续效果
        this.ctx.lineCap = 'round'
        this.ctx.lineJoin = 'round'

        for (let i = 1; i < points.length; i++) {
          const currentPoint = points[i]
          const prevPoint = points[i - 1]
          const lineWidth = this.calculateDynamicStrokeWidth(currentPoint, prevPoint, penStyle, strokeWidth)

          // 模拟圆珠笔的断续效果（使用确定性随机数）
          const ballpointSeed = Math.floor(currentPoint.x * 50 + currentPoint.y * 50 + i)
          if (this.seededRandom(ballpointSeed) > 0.1) { // 90%的概率绘制
            this.ctx.lineWidth = lineWidth
            this.ctx.globalAlpha = this.seededRandom(ballpointSeed + 1) > 0.2 ? 1.0 : 0.7 // 偶尔变淡
            this.ctx.beginPath()

            if (i < points.length - 1) {
              const nextPoint = points[i + 1]
              const controlPoint = this.getControlPoint(currentPoint, prevPoint, nextPoint)
              this.ctx.moveTo(prevPoint.x, prevPoint.y)
              this.ctx.quadraticCurveTo(controlPoint.x, controlPoint.y, currentPoint.x, currentPoint.y)
            } else {
              this.ctx.moveTo(prevPoint.x, prevPoint.y)
              this.ctx.lineTo(currentPoint.x, currentPoint.y)
            }
            this.ctx.stroke()
          }

          // 移除墨水聚集点 - 基于用户反馈，适中笔迹不需要黑色圆圈
          // 保持线条的简洁和清晰
        }
        this.ctx.globalAlpha = 1.0
        break

      case 'elegant':
        // 优雅笔：平滑渐变，由粗到细的连笔之美
        this.drawElegantStroke(points, strokeColor, strokeWidth)
        break
    }
  }

  /**
   * 绘制优雅笔迹 - 基于Fabric.js和Vue3-Signature-Pad的速度压力感应技术
   */
  private drawElegantStroke(points: SignaturePoint[], strokeColor: string, strokeWidth: number): void {
    if (points.length < 2) return

    this.ctx.strokeStyle = strokeColor
    this.ctx.fillStyle = strokeColor
    this.ctx.lineCap = 'round'
    this.ctx.lineJoin = 'round'
    this.ctx.globalCompositeOperation = 'source-over'

    // 基于Fabric.js PencilBrush的速度感应算法
    // 预处理点数据，计算速度和压力
    const processedPoints = this.preprocessPointsForVelocity(points, strokeWidth)

    // 使用Fabric.js的平滑路径技术绘制连续渐变
    this.drawVelocityBasedPath(processedPoints)

    // 添加连笔的优美效果 - 基于速度变化的智能连接
    this.addVelocityBasedConnections(processedPoints)
  }

  /**
   * 预处理点数据，计算速度和动态线宽 - 基于Vue3-Signature-Pad算法
   */
  private preprocessPointsForVelocity(points: SignaturePoint[], baseWidth: number): Array<SignaturePoint & {
    velocity: number,
    dynamicWidth: number,
    smoothedWidth: number
  }> {
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

  /**
   * 基于速度的路径绘制 - 使用Fabric.js的平滑算法
   */
  private drawVelocityBasedPath(
    processedPoints: Array<SignaturePoint & { velocity: number, dynamicWidth: number, smoothedWidth: number }>
  ): void {
    if (processedPoints.length < 2) return

    // 基于Fabric.js的convertPointsToSVGPath技术
    // 创建平滑的连续路径
    for (let i = 1; i < processedPoints.length; i++) {
      const currentPoint = processedPoints[i]
      const prevPoint = processedPoints[i - 1]

      // 绘制渐变线段
      this.drawVelocitySegment(prevPoint, currentPoint, prevPoint.smoothedWidth, currentPoint.smoothedWidth)
    }
  }

  /**
   * 绘制基于速度的单个线段 - 实现由粗到细的渐变
   */
  private drawVelocitySegment(
    startPoint: SignaturePoint & { smoothedWidth: number },
    endPoint: SignaturePoint & { smoothedWidth: number },
    startWidth: number,
    endWidth: number
  ): void {
    // 基于Fabric.js的PencilBrush算法
    // 创建平滑的渐变路径
    const distance = Math.sqrt(
      Math.pow(endPoint.x - startPoint.x, 2) +
      Math.pow(endPoint.y - startPoint.y, 2)
    )

    // 根据距离决定分段数，确保平滑度
    const segments = Math.max(2, Math.min(10, Math.floor(distance / 3)))

    this.ctx.beginPath()

    // 创建渐变路径的边界点
    const pathPoints: Array<{x: number, y: number}> = []

    for (let i = 0; i <= segments; i++) {
      const t = i / segments

      // 使用三次贝塞尔插值实现平滑过渡
      const smoothT = this.smoothStep(t)

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
          this.ctx.moveTo(x + perpX, y + perpY)
        } else {
          this.ctx.lineTo(x + perpX, y + perpY)
        }

        pathPoints.push({ x: x - perpX, y: y - perpY })
      }
    }

    // 绘制下边界（反向）
    for (let i = pathPoints.length - 1; i >= 0; i--) {
      this.ctx.lineTo(pathPoints[i].x, pathPoints[i].y)
    }

    this.ctx.closePath()
    this.ctx.fill()
  }

  /**
   * 基于速度变化的智能连接 - 优化连笔效果，增强连笔的明显性
   */
  private addVelocityBasedConnections(
    processedPoints: Array<SignaturePoint & { velocity: number, dynamicWidth: number, smoothedWidth: number }>
  ): void {
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
        const gradient = this.ctx.createRadialGradient(
          currentPoint.x, currentPoint.y, 0,
          currentPoint.x, currentPoint.y, connectionRadius
        )
        gradient.addColorStop(0, this.ctx.fillStyle as string)
        gradient.addColorStop(1, 'transparent')

        const originalFillStyle = this.ctx.fillStyle
        this.ctx.fillStyle = gradient

        this.ctx.beginPath()
        this.ctx.arc(currentPoint.x, currentPoint.y, connectionRadius, 0, Math.PI * 2)
        this.ctx.fill()

        this.ctx.fillStyle = originalFillStyle
      }

      // 额外的连笔增强：在所有转折点添加小的连接点
      if (angleDiff > 0.05) { // 很小的角度变化也添加连接
        const smallConnectionRadius = currentPoint.smoothedWidth * 0.2

        this.ctx.beginPath()
        this.ctx.arc(currentPoint.x, currentPoint.y, smallConnectionRadius, 0, Math.PI * 2)
        this.ctx.fill()
      }
    }
  }

  /**
   * 平滑插值函数 - 基于Paper.js的平滑算法
   */
  private smoothStep(t: number): number {
    // 使用三次贝塞尔曲线进行平滑插值
    return t * t * (3 - 2 * t)
  }

  /**
   * 获取控制点（用于贝塞尔曲线平滑） - 与signature.ts中的实现一致
   */
  private getControlPoint(current: SignaturePoint, previous: SignaturePoint, next: SignaturePoint): SignaturePoint {
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

  /**
   * 清除画布
   */
  private clearCanvas(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
  }

  /**
   * 注册事件监听器
   */
  on(event: string, callback: Function): void {
    if (!this.eventCallbacks.has(event)) {
      this.eventCallbacks.set(event, [])
    }
    this.eventCallbacks.get(event)!.push(callback)
  }

  /**
   * 移除事件监听器
   */
  off(event: string, callback?: Function): void {
    if (!this.eventCallbacks.has(event)) return

    if (callback) {
      const callbacks = this.eventCallbacks.get(event)!
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
      }
    } else {
      this.eventCallbacks.delete(event)
    }
  }

  /**
   * 触发事件
   */
  private emit(event: string, ...args: any[]): void {
    const callbacks = this.eventCallbacks.get(event)
    if (callbacks) {
      callbacks.forEach(callback => callback(...args))
    }
  }

  /**
   * 在离屏画布上绘制完整路径
   */
  private drawCompletePathToOffscreen(path: SignaturePath): void {
    if (!this.offscreenCtx || path.points.length < 2) return

    // 临时切换绘制上下文
    const originalCtx = this.ctx
    this.ctx = this.offscreenCtx as CanvasRenderingContext2D

    // 优先使用路径中保存的笔迹样式，如果没有则使用选项中的样式
    const penStyle = path.penStyle || this.options.penStyle || 'pen'
    this.drawStyledStrokeForReplay(path.points, penStyle, path.strokeColor, path.strokeWidth)

    // 恢复原始上下文
    this.ctx = originalCtx
  }

  /**
   * 在离屏画布上绘制部分路径
   */
  private drawPartialPathToOffscreen(path: SignaturePath, progress: number): void {
    if (!this.offscreenCtx || path.points.length < 2) return

    // 基于时间而不是点数来计算进度
    const pathStartTime = path.startTime || 0
    const pathDuration = path.duration || 0
    const currentPathTime = pathStartTime + pathDuration * progress

    // 找到当前时间对应的点
    const visiblePoints = this.getPointsUpToTime(path.points, pathStartTime, currentPathTime)

    if (visiblePoints.length < 2) return

    // 临时切换绘制上下文
    const originalCtx = this.ctx
    this.ctx = this.offscreenCtx as CanvasRenderingContext2D

    // 优先使用路径中保存的笔迹样式，如果没有则使用选项中的样式
    const penStyle = path.penStyle || this.options.penStyle || 'pen'
    this.drawStyledStrokeForReplay(visiblePoints, penStyle, path.strokeColor, path.strokeWidth)

    // 恢复原始上下文
    this.ctx = originalCtx
  }

  /**
   * 销毁控制器
   */
  destroy(): void {
    this.stop()
    this.eventCallbacks.clear()
    this.replayData = null

    // 清理ImageBitmap资源
    if (this.lastFrameImageBitmap) {
      this.lastFrameImageBitmap.close()
      this.lastFrameImageBitmap = null
    }
  }
}

/**
 * 从签名数据生成回放数据
 */
export function createReplayData(signatureData: SignatureData): SignatureReplay {
  // 首先处理所有路径的点数据和持续时间
  const processedPaths = signatureData.paths.map((path) => {
    // 使用实际的时间戳信息，如果没有则基于距离和速度估算
    const points = path.points.map((point, pointIndex) => {
      let relativeTime: number

      if (point.time && path.points[0].time) {
        // 使用实际时间戳
        relativeTime = point.time - path.points[0].time
      } else {
        // 基于点间距离估算时间
        if (pointIndex === 0) {
          relativeTime = 0
        } else {
          const prevPoint = path.points[pointIndex - 1]
          const distance = Math.sqrt(
            Math.pow(point.x - prevPoint.x, 2) +
            Math.pow(point.y - prevPoint.y, 2)
          )
          // 假设平均绘制速度为100像素/秒
          const estimatedTime = distance / 100 * 1000
          relativeTime = (points[pointIndex - 1]?.relativeTime || 0) + Math.max(estimatedTime, 16) // 最小16ms间隔
        }
      }

      return {
        ...point,
        relativeTime
      }
    })

    // 计算路径持续时间
    const duration = points.length > 0 ?
      points[points.length - 1].relativeTime! :
      0

    return {
      ...path,
      points,
      duration
    }
  })

  // 然后计算每个路径的开始和结束时间
  const paths: SignaturePath[] = []

  for (let index = 0; index < processedPaths.length; index++) {
    const path = processedPaths[index]
    let startTime: number

    if (index === 0) {
      startTime = 0
    } else {
      const prevPath = paths[index - 1]
      const pauseTime = estimatePauseTime(
        signatureData.paths[index - 1].points,
        signatureData.paths[index].points
      )
      startTime = prevPath.endTime! + pauseTime
    }

    const endTime = startTime + path.duration!

    const finalPath = {
      ...path,
      startTime,
      endTime
    }

    console.log(`路径 ${index}: 开始时间=${startTime}, 结束时间=${endTime}, 持续时间=${path.duration}`)

    paths.push(finalPath)
  }

  const totalDuration = paths.length > 0 ?
    paths[paths.length - 1].endTime! :
    0

  console.log('回放数据生成完成:')
  console.log('- 路径数量:', paths.length)
  console.log('- 总时长:', totalDuration)
  console.log('- 路径详情:', paths.map(p => ({
    startTime: p.startTime,
    endTime: p.endTime,
    duration: p.duration,
    pointCount: p.points.length
  })))

  // 计算元数据
  const totalDistance = paths.reduce((sum, path) => {
    return sum + calculatePathDistance(path.points)
  }, 0)

  const averageSpeed = totalDuration > 0 ? totalDistance / (totalDuration / 1000) : 0

  // 计算平均停顿时间
  const pauseTimes = paths.slice(1).map((path, index) => {
    const prevPath = paths[index]
    return path.startTime! - prevPath.endTime!
  })
  const averagePauseTime = pauseTimes.length > 0 ?
    pauseTimes.reduce((sum, time) => sum + time, 0) / pauseTimes.length :
    0

  return {
    paths,
    totalDuration,
    speed: 1,
    metadata: {
      deviceType: detectDeviceType(signatureData),
      averageSpeed,
      totalDistance,
      averagePauseTime
    }
  }
}

/**
 * 估算两个笔画之间的停顿时间
 */
function estimatePauseTime(prevPoints: SignaturePoint[], currentPoints: SignaturePoint[]): number {
  if (prevPoints.length === 0 || currentPoints.length === 0) {
    return 200 // 默认停顿时间
  }

  const lastPoint = prevPoints[prevPoints.length - 1]
  const firstPoint = currentPoints[0]

  // 如果有实际时间戳，使用实际时间差
  if (lastPoint.time && firstPoint.time) {
    return Math.max(firstPoint.time - lastPoint.time, 50) // 最小50ms
  }

  // 基于距离估算停顿时间
  const distance = Math.sqrt(
    Math.pow(firstPoint.x - lastPoint.x, 2) +
    Math.pow(firstPoint.y - lastPoint.y, 2)
  )

  // 距离越远，停顿时间越长
  return Math.min(Math.max(distance * 2, 100), 1000) // 100ms到1000ms之间
}

/**
 * 检测设备类型
 */
function detectDeviceType(signatureData: SignatureData): 'mouse' | 'touch' | 'pen' {
  // 基于签名特征检测设备类型
  const totalPoints = signatureData.paths.reduce((sum, path) => sum + path.points.length, 0)
  const totalPaths = signatureData.paths.length

  if (totalPoints === 0) return 'touch'

  const avgPointsPerPath = totalPoints / totalPaths

  // 触摸设备通常点密度较高
  if (avgPointsPerPath > 20) {
    return 'touch'
  }

  // 鼠标设备点密度较低
  if (avgPointsPerPath < 10) {
    return 'mouse'
  }

  // 检查是否有压感信息
  const hasPressure = signatureData.paths.some(path =>
    path.points.some(point => point.pressure !== undefined)
  )

  return hasPressure ? 'pen' : 'touch'
}

/**
 * 计算路径总距离
 */
function calculatePathDistance(points: SignaturePoint[]): number {
  let distance = 0
  for (let i = 1; i < points.length; i++) {
    const dx = points[i].x - points[i - 1].x
    const dy = points[i].y - points[i - 1].y
    distance += Math.sqrt(dx * dx + dy * dy)
  }
  return distance
}

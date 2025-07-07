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
  private lastRenderedTime: number = -1
  private completedPaths: Set<number> = new Set()
  private offscreenCanvas: HTMLCanvasElement | null = null
  private offscreenCtx: CanvasRenderingContext2D | null = null
  private needsFullRedraw: boolean = true

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')!
    this.initializeOffscreenCanvas()
  }

  /**
   * 初始化离屏画布用于性能优化
   */
  private initializeOffscreenCanvas(): void {
    this.offscreenCanvas = document.createElement('canvas')
    this.offscreenCanvas.width = this.canvas.width
    this.offscreenCanvas.height = this.canvas.height
    this.offscreenCtx = this.offscreenCanvas.getContext('2d')!
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
    this.lastRenderedTime = -1
    this.completedPaths.clear()
    this.needsFullRedraw = true

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

    // 跳转时需要完全重绘
    this.needsFullRedraw = true

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
   * 渲染指定时间的帧 - 优化版本，减少重绘
   */
  private renderFrame(time: number): void {
    if (!this.replayData) return

    // 检查是否需要完全重绘
    const needsFullRedraw = this.needsFullRedraw || time < this.lastRenderedTime

    if (needsFullRedraw) {
      this.renderFullFrame(time)
      this.needsFullRedraw = false
    } else {
      this.renderIncrementalFrame(time)
    }

    this.lastRenderedTime = time
  }

  /**
   * 完全重绘帧（用于初始化或时间倒退）
   */
  private renderFullFrame(time: number): void {
    if (!this.replayData) return

    this.clearCanvas()
    this.completedPaths.clear()

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
        this.drawCompletePath(path)
        this.completedPaths.add(i)

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

      this.drawPartialPath(path, pathProgress)
      break
    }
  }

  /**
   * 增量渲染帧（只更新变化的部分）
   */
  private renderIncrementalFrame(time: number): void {
    if (!this.replayData) return

    // 找到当前正在绘制的路径
    for (let i = 0; i < this.replayData.paths.length; i++) {
      const path = this.replayData.paths[i]
      const pathStartTime = path.startTime || 0
      const pathEndTime = path.endTime || pathStartTime + (path.duration || 0)

      if (time < pathStartTime) {
        break
      }

      if (time >= pathEndTime) {
        // 检查这个路径是否刚刚完成
        if (!this.completedPaths.has(i)) {
          // 路径刚完成，需要重绘这个路径
          this.drawCompletePath(path)
          this.completedPaths.add(i)
          this.emit('replay-path-end', i, path)
        }
        continue
      }

      // 正在绘制的路径 - 使用离屏画布优化
      this.renderActivePathOptimized(path, time, pathStartTime, pathEndTime, i)
      break
    }
  }

  /**
   * 优化的活动路径渲染
   */
  private renderActivePathOptimized(path: SignaturePath, time: number, pathStartTime: number, pathEndTime: number, pathIndex: number): void {
    if (!this.offscreenCanvas || !this.offscreenCtx) return

    const pathProgress = Math.max(0, Math.min(1, (time - pathStartTime) / Math.max(pathEndTime - pathStartTime, 1)))

    // 检查是否刚开始这个笔画
    if (pathProgress > 0 && Math.abs(time - pathStartTime) < 32) {
      this.emit('replay-path-start', pathIndex, path)
    }

    // 清除当前路径区域（估算边界框）
    const bounds = this.getPathBounds(path, pathProgress)
    if (bounds) {
      // 清除主画布上的路径区域
      this.ctx.clearRect(bounds.x - 10, bounds.y - 10, bounds.width + 20, bounds.height + 20)

      // 重新绘制所有已完成的路径到这个区域
      this.redrawCompletedPathsInBounds(bounds)
    }

    // 绘制当前进度的路径
    this.drawPartialPath(path, pathProgress)
  }

  /**
   * 获取路径的边界框
   */
  private getPathBounds(path: SignaturePath, progress: number): { x: number; y: number; width: number; height: number } | null {
    if (path.points.length === 0) return null

    const visiblePointCount = Math.ceil(path.points.length * progress)
    const visiblePoints = path.points.slice(0, visiblePointCount)

    if (visiblePoints.length === 0) return null

    let minX = visiblePoints[0].x
    let maxX = visiblePoints[0].x
    let minY = visiblePoints[0].y
    let maxY = visiblePoints[0].y

    for (const point of visiblePoints) {
      minX = Math.min(minX, point.x)
      maxX = Math.max(maxX, point.x)
      minY = Math.min(minY, point.y)
      maxY = Math.max(maxY, point.y)
    }

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    }
  }

  /**
   * 在指定边界内重绘已完成的路径
   */
  private redrawCompletedPathsInBounds(bounds: { x: number; y: number; width: number; height: number }): void {
    if (!this.replayData) return

    for (let i = 0; i < this.replayData.paths.length; i++) {
      if (this.completedPaths.has(i)) {
        const path = this.replayData.paths[i]
        // 简单检查路径是否与边界相交
        if (this.pathIntersectsBounds(path, bounds)) {
          this.drawCompletePath(path)
        }
      }
    }
  }

  /**
   * 检查路径是否与边界相交
   */
  private pathIntersectsBounds(path: SignaturePath, bounds: { x: number; y: number; width: number; height: number }): boolean {
    for (const point of path.points) {
      if (point.x >= bounds.x && point.x <= bounds.x + bounds.width &&
          point.y >= bounds.y && point.y <= bounds.y + bounds.height) {
        return true
      }
    }
    return false
  }

  /**
   * 绘制完整路径 - 使用与录制时相同的笔迹样式算法
   */
  private drawCompletePath(path: SignaturePath): void {
    if (path.points.length < 2) return

    // 优先使用路径中保存的笔迹样式，如果没有则使用选项中的样式
    const penStyle = path.penStyle || this.options.penStyle || 'pen'
    this.drawStyledStrokeForReplay(path.points, penStyle, path.strokeColor, path.strokeWidth)
  }

  /**
   * 绘制部分路径 - 使用与录制时相同的笔迹样式算法
   */
  private drawPartialPath(path: SignaturePath, progress: number): void {
    if (path.points.length < 2) return

    // 基于时间而不是点数来计算进度
    const pathStartTime = path.startTime || 0
    const pathDuration = path.duration || 0
    const currentPathTime = pathStartTime + pathDuration * progress

    // 找到当前时间对应的点
    const visiblePoints = this.getPointsUpToTime(path.points, pathStartTime, currentPathTime)

    if (visiblePoints.length < 2) return

    // 优先使用路径中保存的笔迹样式，如果没有则使用选项中的样式
    const penStyle = path.penStyle || this.options.penStyle || 'pen'
    this.drawStyledStrokeForReplay(visiblePoints, penStyle, path.strokeColor, path.strokeWidth)
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

          // 添加墨迹扩散效果
          if (lineWidth > 8 && Math.random() > 0.6) {
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

          // 添加多层纹理效果
          for (let j = 0; j < 3; j++) {
            if (Math.random() > 0.5) {
              this.ctx.globalAlpha = 0.2
              this.ctx.lineWidth = lineWidth * 0.3
              const offsetX = (Math.random() - 0.5) * 2
              const offsetY = (Math.random() - 0.5) * 2
              this.ctx.beginPath()
              this.ctx.moveTo(prevPoint.x + offsetX, prevPoint.y + offsetY)
              this.ctx.lineTo(currentPoint.x + offsetX, currentPoint.y + offsetY)
              this.ctx.stroke()
            }
          }

          // 添加石墨颗粒效果
          if (Math.random() > 0.8) {
            this.ctx.globalAlpha = 0.4
            for (let k = 0; k < 5; k++) {
              this.ctx.beginPath()
              this.ctx.arc(
                currentPoint.x + (Math.random() - 0.5) * 3,
                currentPoint.y + (Math.random() - 0.5) * 3,
                Math.random() * 0.8,
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

          // 模拟圆珠笔的断续效果
          if (Math.random() > 0.1) { // 90%的概率绘制
            this.ctx.lineWidth = lineWidth
            this.ctx.globalAlpha = Math.random() > 0.2 ? 1.0 : 0.7 // 偶尔变淡
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

          // 偶尔添加墨水聚集点
          if (Math.random() > 0.95) {
            this.ctx.globalAlpha = 0.8
            this.ctx.beginPath()
            this.ctx.arc(currentPoint.x, currentPoint.y, lineWidth * 0.8, 0, Math.PI * 2)
            this.ctx.fill()
          }
        }
        this.ctx.globalAlpha = 1.0
        break
    }
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
   * 销毁控制器
   */
  destroy(): void {
    this.stop()
    this.eventCallbacks.clear()
    this.replayData = null
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

import type { 
  SignatureReplay, 
  SignaturePath, 
  SignaturePoint, 
  SignatureData,
  ReplayState, 
  ReplayOptions,
  ReplayController
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

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')!
  }

  /**
   * 设置回放数据
   */
  setReplayData(data: SignatureReplay, options: ReplayOptions = {}): void {
    this.replayData = data
    this.options = { ...options }
    this.speed = options.speed || data.speed || 1
    this.currentTime = options.startTime || 0
    this.state = 'idle'
  }

  /**
   * 开始播放
   */
  play(): void {
    if (!this.replayData || this.state === 'playing') return

    if (this.state === 'paused') {
      // 从暂停状态恢复
      this.state = 'playing'
      this.startTimestamp = performance.now() - this.pausedTime
      this.emit('replay-resume')
    } else {
      // 开始新的播放
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
   * 渲染指定时间的帧
   */
  private renderFrame(time: number): void {
    if (!this.replayData) return

    this.clearCanvas()

    let currentPathIndex = -1

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
        continue
      }

      // 正在绘制这个笔画
      currentPathIndex = i
      const pathProgress = (time - pathStartTime) / (pathEndTime - pathStartTime)
      this.drawPartialPath(path, pathProgress)

      // 触发笔画开始事件（只触发一次）
      if (pathProgress > 0 && pathProgress < 0.1) {
        this.emit('replay-path-start', i, path)
      }

      break
    }

    // 检查是否有笔画刚刚结束
    if (currentPathIndex >= 0) {
      const path = this.replayData.paths[currentPathIndex]
      const pathEndTime = path.endTime || (path.startTime || 0) + (path.duration || 0)
      
      if (Math.abs(time - pathEndTime) < 50) { // 50ms容差
        this.emit('replay-path-end', currentPathIndex, path)
      }
    }
  }

  /**
   * 绘制完整路径
   */
  private drawCompletePath(path: SignaturePath): void {
    if (path.points.length < 2) return

    this.ctx.beginPath()
    this.ctx.strokeStyle = path.strokeColor
    this.ctx.lineWidth = path.strokeWidth
    this.ctx.lineCap = 'round'
    this.ctx.lineJoin = 'round'

    this.ctx.moveTo(path.points[0].x, path.points[0].y)
    
    for (let i = 1; i < path.points.length; i++) {
      this.ctx.lineTo(path.points[i].x, path.points[i].y)
    }

    this.ctx.stroke()
  }

  /**
   * 绘制部分路径
   */
  private drawPartialPath(path: SignaturePath, progress: number): void {
    if (path.points.length < 2) return

    const totalPoints = path.points.length
    const targetPointIndex = Math.floor(totalPoints * progress)
    
    if (targetPointIndex < 1) return

    this.ctx.beginPath()
    this.ctx.strokeStyle = path.strokeColor
    this.ctx.lineWidth = path.strokeWidth
    this.ctx.lineCap = 'round'
    this.ctx.lineJoin = 'round'

    this.ctx.moveTo(path.points[0].x, path.points[0].y)
    
    for (let i = 1; i <= targetPointIndex; i++) {
      this.ctx.lineTo(path.points[i].x, path.points[i].y)
    }

    // 如果进度在两个点之间，插值绘制
    if (progress < 1 && targetPointIndex < totalPoints - 1) {
      const pointProgress = (totalPoints * progress) - targetPointIndex
      const currentPoint = path.points[targetPointIndex]
      const nextPoint = path.points[targetPointIndex + 1]
      
      const interpolatedX = currentPoint.x + (nextPoint.x - currentPoint.x) * pointProgress
      const interpolatedY = currentPoint.y + (nextPoint.y - currentPoint.y) * pointProgress
      
      this.ctx.lineTo(interpolatedX, interpolatedY)
    }

    this.ctx.stroke()
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
  const paths = signatureData.paths.map((path, index) => {
    // 计算路径的时间信息
    const points = path.points.map((point, pointIndex) => ({
      ...point,
      relativeTime: pointIndex * 50 // 假设每个点间隔50ms
    }))

    const startTime = index > 0 ? 
      signatureData.paths[index - 1].endTime! + 200 : // 笔画间200ms间隔
      0

    const duration = points.length * 50 // 基于点数计算持续时间
    const endTime = startTime + duration

    return {
      ...path,
      points,
      startTime,
      endTime,
      duration
    }
  })

  const totalDuration = paths.length > 0 ? 
    paths[paths.length - 1].endTime! : 
    0

  // 计算元数据
  const totalDistance = paths.reduce((sum, path) => {
    return sum + calculatePathDistance(path.points)
  }, 0)

  const averageSpeed = totalDuration > 0 ? totalDistance / (totalDuration / 1000) : 0

  return {
    paths,
    totalDuration,
    speed: 1,
    metadata: {
      deviceType: 'touch', // 可以根据实际情况检测
      averageSpeed,
      totalDistance,
      averagePauseTime: 200
    }
  }
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

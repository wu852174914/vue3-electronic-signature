/**
 * 签名组件的属性接口
 */
export interface SignatureProps {
  /** 画布宽度，支持数字或字符串（如 '100%'） */
  width?: number | string
  /** 画布高度，支持数字或字符串（如 '300px'） */
  height?: number | string
  /** 笔迹样式 - 默认为适中笔迹 */
  penStyle?: PenStyle
  /** 画笔颜色 */
  strokeColor?: string
  /** 画笔粗细 */
  strokeWidth?: number
  /** 背景颜色 */
  backgroundColor?: string
  /** 是否禁用签名功能 */
  disabled?: boolean
  /** 占位符文本 */
  placeholder?: string
  /** 是否启用平滑绘制 */
  smoothing?: boolean
  /** 是否启用压感效果 */
  pressureSensitive?: boolean
  /** 最小画笔宽度（压感模式下） */
  minStrokeWidth?: number
  /** 最大画笔宽度（压感模式下） */
  maxStrokeWidth?: number
  /** 画布边框样式 */
  borderStyle?: string
  /** 画布圆角 */
  borderRadius?: string
  /** 是否启用回放模式 */
  replayMode?: boolean
  /** 实时渲染模式 - 确保书写时与最终效果一致 */
  realTimeMode?: boolean
  /** 回放数据 */
  replayData?: SignatureReplay
  /** 回放选项 */
  replayOptions?: ReplayOptions
}

/**
 * 签名数据点
 */
export interface SignaturePoint {
  /** X坐标 */
  x: number
  /** Y坐标 */
  y: number
  /** 时间戳（毫秒） */
  time: number
  /** 压力值（0-1） */
  pressure?: number
  /** 相对于笔画开始的时间偏移（毫秒） */
  relativeTime?: number
  /** 预计算的随机效果数据（确保回放一致性） */
  randomEffects?: {
    /** 毛笔随机因子 */
    brushRandomFactor?: number
    /** 毛笔墨迹扩散 */
    brushInkSpread?: boolean
    /** 铅笔随机性 */
    pencilRandomness?: number
    /** 铅笔纹理效果 */
    pencilTextures?: Array<{ offsetX: number; offsetY: number; show: boolean }>
    /** 铅笔颗粒效果 */
    pencilParticles?: Array<{ x: number; y: number; radius: number; show: boolean }>
    /** 圆珠笔断续效果 */
    ballpointSkip?: boolean
    /** 圆珠笔透明度 */
    ballpointAlpha?: number
    /** 圆珠笔墨水聚集 */
    ballpointInkDrop?: boolean
  }
}

/**
 * 签名路径
 */
export interface SignaturePath {
  /** 路径点集合 */
  points: SignaturePoint[]
  /** 画笔颜色 */
  strokeColor: string
  /** 画笔粗细 */
  strokeWidth: number
  /** 笔迹样式 */
  penStyle?: PenStyle
  /** 笔画开始时间（毫秒） */
  startTime?: number
  /** 笔画结束时间（毫秒） */
  endTime?: number
  /** 笔画持续时间（毫秒） */
  duration?: number
}

/**
 * 签名数据
 */
export interface SignatureData {
  /** 所有签名路径 */
  paths: SignaturePath[]
  /** 画布尺寸 */
  canvasSize: {
    width: number
    height: number
  }
  /** 创建时间 */
  timestamp: number
  /** 是否为空 */
  isEmpty: boolean
}

/**
 * 导出格式类型
 */
export type ExportFormat = 'png' | 'jpeg' | 'svg' | 'base64'

/**
 * 导出选项
 */
export interface ExportOptions {
  /** 导出格式 */
  format: ExportFormat
  /** 图片质量（0-1，仅对jpeg格式有效） */
  quality?: number
  /** 导出尺寸 */
  size?: {
    width: number
    height: number
  }
  /** 背景颜色（透明背景设为 'transparent'） */
  backgroundColor?: string
}

/**
 * 签名组件事件
 */
export interface SignatureEvents extends ReplayEvents {
  /** 开始签名 */
  'signature-start': () => void
  /** 签名进行中 */
  'signature-drawing': (data: SignatureData) => void
  /** 签名结束 */
  'signature-end': (data: SignatureData) => void
  /** 清除签名 */
  'signature-clear': () => void
  /** 撤销操作 */
  'signature-undo': (data: SignatureData) => void
  /** 重做操作 */
  'signature-redo': (data: SignatureData) => void
}

/**
 * 签名组件方法
 */
export interface SignatureMethods extends ReplayController {
  /** 清除签名 */
  clear(): void
  /** 撤销上一步操作 */
  undo(): void
  /** 重做操作 */
  redo(): void
  /** 保存签名 */
  save(options?: ExportOptions): string
  /** 判断签名是否为空 */
  isEmpty(): boolean
  /** 从数据URL加载签名 */
  fromDataURL(dataURL: string): void
  /** 获取签名数据 */
  getSignatureData(): SignatureData
  /** 设置签名数据 */
  setSignatureData(data: SignatureData): void
  /** 调整画布尺寸 */
  resize(width?: number, height?: number): void
  /** 开始回放签名 */
  startReplay(replayData: SignatureReplay, options?: ReplayOptions): void
  /** 获取回放数据 */
  getReplayData(): SignatureReplay | null
  /** 设置回放模式 */
  setReplayMode(enabled: boolean): void
}

/**
 * 触摸事件类型
 */
export type TouchEventType = 'start' | 'move' | 'end'

/**
 * 笔迹样式类型
 */
export type PenStyle = 'ballpoint' | 'elegant' | 'brush' | 'pencil' | 'pen' | 'marker'

/**
 * 笔迹样式配置
 */
export interface PenStyleConfig {
  /** 样式名称 */
  name: string
  /** 样式描述 */
  description: string
  /** 基础线宽 */
  strokeWidth: number
  /** 是否启用平滑 */
  smoothing: boolean
  /** 压感配置 */
  pressure: {
    enabled: boolean
    min: number
    max: number
  }
  /** 线条端点样式 */
  lineCap: CanvasLineCap
  /** 线条连接样式 */
  lineJoin: CanvasLineJoin
  /** 推荐颜色 */
  recommendedColor?: string
}

/**
 * 绘制选项
 */
export interface DrawOptions {
  /** 画笔颜色 */
  strokeColor: string
  /** 画笔粗细 */
  strokeWidth: number
  /** 是否平滑 */
  smoothing: boolean
  /** 压感设置 */
  pressure: {
    enabled: boolean
    min: number
    max: number
  }
  /** 线条端点样式 */
  lineCap?: CanvasLineCap
  /** 线条连接样式 */
  lineJoin?: CanvasLineJoin
}

/**
 * 签名回放数据
 */
export interface SignatureReplay {
  /** 带时间信息的路径集合 */
  paths: SignaturePath[]
  /** 总回放时长（毫秒） */
  totalDuration: number
  /** 回放速度倍率 */
  speed: number
  /** 签名元数据 */
  metadata: {
    /** 设备类型 */
    deviceType: 'mouse' | 'touch' | 'pen'
    /** 平均书写速度（像素/秒） */
    averageSpeed: number
    /** 总绘制距离（像素） */
    totalDistance: number
    /** 笔画间平均停顿时间（毫秒） */
    averagePauseTime: number
  }
}

/**
 * 回放控制状态
 */
export type ReplayState = 'idle' | 'playing' | 'paused' | 'stopped' | 'completed'

/**
 * 回放控制选项
 */
export interface ReplayOptions {
  /** 回放速度倍率 */
  speed?: number
  /** 是否循环播放 */
  loop?: boolean
  /** 是否显示控制条 */
  showControls?: boolean
  /** 是否自动开始播放 */
  autoPlay?: boolean
  /** 回放开始时间（毫秒） */
  startTime?: number
  /** 回放结束时间（毫秒） */
  endTime?: number
  /** 绘制选项（确保回放与录制一致） */
  drawOptions?: DrawOptions
  /** 笔迹样式（确保回放与录制一致） */
  penStyle?: PenStyle
}

/**
 * 回放事件
 */
export interface ReplayEvents {
  /** 回放开始 */
  'replay-start': () => void
  /** 回放进度更新 */
  'replay-progress': (progress: number, currentTime: number) => void
  /** 回放暂停 */
  'replay-pause': () => void
  /** 回放恢复 */
  'replay-resume': () => void
  /** 回放停止 */
  'replay-stop': () => void
  /** 回放完成 */
  'replay-complete': () => void
  /** 笔画开始 */
  'replay-path-start': (pathIndex: number, path: SignaturePath) => void
  /** 笔画结束 */
  'replay-path-end': (pathIndex: number, path: SignaturePath) => void
  /** 回放速度改变 */
  'replay-speed-change': (speed: number) => void
}

/**
 * 回放控制器方法
 */
export interface ReplayController {
  /** 播放 */
  play(): void
  /** 暂停 */
  pause(): void
  /** 停止 */
  stop(): void
  /** 跳转到指定时间 */
  seek(time: number): void
  /** 设置播放速度 */
  setSpeed(speed: number): void
  /** 获取当前状态 */
  getState(): ReplayState
  /** 获取当前时间 */
  getCurrentTime(): number
  /** 获取总时长 */
  getTotalDuration(): number
  /** 获取当前进度（0-1） */
  getProgress(): number
}

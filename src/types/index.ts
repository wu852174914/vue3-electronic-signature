/**
 * 签名组件的属性接口
 */
export interface SignatureProps {
  /** 画布宽度，支持数字或字符串（如 '100%'） */
  width?: number | string
  /** 画布高度，支持数字或字符串（如 '300px'） */
  height?: number | string
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
}

/**
 * 签名数据点
 */
export interface SignaturePoint {
  /** X坐标 */
  x: number
  /** Y坐标 */
  y: number
  /** 时间戳 */
  time: number
  /** 压力值（0-1） */
  pressure?: number
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
export interface SignatureEvents {
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
export interface SignatureMethods {
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
}

/**
 * 触摸事件类型
 */
export type TouchEventType = 'start' | 'move' | 'end'

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
}

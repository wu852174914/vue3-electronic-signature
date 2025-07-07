import type { PenStyle, PenStyleConfig } from '../types'

/**
 * 预设的笔迹样式配置
 */
export const PEN_STYLE_CONFIGS: Record<PenStyle, PenStyleConfig> = {
  pen: {
    name: '钢笔',
    description: '细线条，高精度，适合正式签名',
    strokeWidth: 1.5,
    smoothing: true,
    pressure: {
      enabled: false,
      min: 1,
      max: 2
    },
    lineCap: 'round',
    lineJoin: 'round',
    recommendedColor: '#000080'
  },
  
  brush: {
    name: '毛笔',
    description: '压感变化，粗细不均，艺术感强',
    strokeWidth: 4,
    smoothing: true,
    pressure: {
      enabled: true,
      min: 2,
      max: 8
    },
    lineCap: 'round',
    lineJoin: 'round',
    recommendedColor: '#2c3e50'
  },
  
  marker: {
    name: '马克笔',
    description: '粗线条，均匀宽度，醒目清晰',
    strokeWidth: 5,
    smoothing: true,
    pressure: {
      enabled: false,
      min: 4,
      max: 6
    },
    lineCap: 'round',
    lineJoin: 'round',
    recommendedColor: '#e74c3c'
  },
  
  pencil: {
    name: '铅笔',
    description: '中等粗细，略有纹理，自然感强',
    strokeWidth: 2,
    smoothing: false,
    pressure: {
      enabled: true,
      min: 1.5,
      max: 3
    },
    lineCap: 'round',
    lineJoin: 'round',
    recommendedColor: '#7f8c8d'
  },
  
  ballpoint: {
    name: '圆珠笔',
    description: '细线条，轻微变化，日常书写',
    strokeWidth: 1,
    smoothing: true,
    pressure: {
      enabled: true,
      min: 0.8,
      max: 1.5
    },
    lineCap: 'round',
    lineJoin: 'round',
    recommendedColor: '#3498db'
  }
}

/**
 * 获取笔迹样式配置
 */
export function getPenStyleConfig(style: PenStyle): PenStyleConfig {
  return PEN_STYLE_CONFIGS[style]
}

/**
 * 获取所有可用的笔迹样式
 */
export function getAllPenStyles(): Array<{ key: PenStyle; config: PenStyleConfig }> {
  return Object.entries(PEN_STYLE_CONFIGS).map(([key, config]) => ({
    key: key as PenStyle,
    config
  }))
}

/**
 * 根据笔迹样式生成绘制选项
 */
export function createDrawOptionsFromPenStyle(
  style: PenStyle,
  customColor?: string
): {
  strokeWidth: number
  smoothing: boolean
  pressure: { enabled: boolean; min: number; max: number }
  lineCap: CanvasLineCap
  lineJoin: CanvasLineJoin
  strokeColor: string
} {
  const config = getPenStyleConfig(style)
  
  return {
    strokeWidth: config.strokeWidth,
    smoothing: config.smoothing,
    pressure: config.pressure,
    lineCap: config.lineCap,
    lineJoin: config.lineJoin,
    strokeColor: customColor || config.recommendedColor || '#000000'
  }
}

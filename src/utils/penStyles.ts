import type { PenStyle, PenStyleConfig } from '../types'

/**
 * 预设的笔迹样式配置
 */
export const PEN_STYLE_CONFIGS: Record<PenStyle, PenStyleConfig> = {
  pen: {
    name: '钢笔',
    description: '极细线条，锐利精准，商务签名',
    strokeWidth: 1,
    smoothing: true,
    pressure: {
      enabled: false,
      min: 1,
      max: 1
    },
    lineCap: 'butt',
    lineJoin: 'miter',
    recommendedColor: '#000080'
  },

  brush: {
    name: '毛笔',
    description: '粗细变化极大，传统书法效果',
    strokeWidth: 8,
    smoothing: true,
    pressure: {
      enabled: true,
      min: 1,
      max: 16
    },
    lineCap: 'round',
    lineJoin: 'round',
    recommendedColor: '#2c3e50'
  },

  marker: {
    name: '马克笔',
    description: '超粗线条，荧光笔效果',
    strokeWidth: 12,
    smoothing: false,
    pressure: {
      enabled: false,
      min: 10,
      max: 14
    },
    lineCap: 'square',
    lineJoin: 'bevel',
    recommendedColor: '#ff6b35'
  },

  pencil: {
    name: '铅笔',
    description: '粗糙纹理，素描效果',
    strokeWidth: 3,
    smoothing: false,
    pressure: {
      enabled: true,
      min: 2,
      max: 5
    },
    lineCap: 'round',
    lineJoin: 'round',
    recommendedColor: '#666666'
  },

  ballpoint: {
    name: '圆珠笔',
    description: '细线条，轻微断续效果',
    strokeWidth: 1.2,
    smoothing: true,
    pressure: {
      enabled: true,
      min: 0.8,
      max: 1.8
    },
    lineCap: 'round',
    lineJoin: 'round',
    recommendedColor: '#1e3a8a'
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

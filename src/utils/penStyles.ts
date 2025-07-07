import type { PenStyle, PenStyleConfig } from '../types'

/**
 * 预设的笔迹样式配置
 */
export const PEN_STYLE_CONFIGS: Record<PenStyle, PenStyleConfig> = {
  ballpoint: {
    name: '适中笔迹',
    description: '连续流畅，简洁专业，商务首选',
    strokeWidth: 2,
    smoothing: true,
    pressure: {
      enabled: true,
      min: 1.5,
      max: 2.5
    },
    lineCap: 'round',
    lineJoin: 'round',
    recommendedColor: '#374151'
  },

  elegant: {
    name: '优雅笔迹',
    description: '智能渐变，由粗到细，速度感应',
    strokeWidth: 3,
    smoothing: true,
    pressure: {
      enabled: true,
      min: 0.3,
      max: 15
    },
    lineCap: 'round',
    lineJoin: 'round',
    recommendedColor: '#374151'
  },

  brush: {
    name: '毛笔',
    description: '传统书法，自然变化，文化韵味',
    strokeWidth: 8,
    smoothing: true,
    pressure: {
      enabled: true,
      min: 1,
      max: 20
    },
    lineCap: 'round',
    lineJoin: 'round',
    recommendedColor: '#2c3e50'
  },

  pencil: {
    name: '铅笔',
    description: '稳定连续，简洁清晰，自然书写',
    strokeWidth: 3,
    smoothing: true,
    pressure: {
      enabled: true,
      min: 2,
      max: 5
    },
    lineCap: 'round',
    lineJoin: 'round',
    recommendedColor: '#666666'
  },

  pen: {
    name: '钢笔',
    description: '极细锐利，精准线条，技术绘图',
    strokeWidth: 1,
    smoothing: true,
    pressure: {
      enabled: true,
      min: 1,
      max: 1
    },
    lineCap: 'round',
    lineJoin: 'round',
    recommendedColor: '#000080'
  },

  marker: {
    name: '马克笔',
    description: '超粗荧光，醒目标记，重点突出',
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

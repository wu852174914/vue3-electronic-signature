import type {
  SignaturePoint,
  SignatureData,
  ExportOptions,
  DrawOptions
} from '../types'

/**
 * 计算两点之间的距离
 */
export function getDistance(point1: SignaturePoint, point2: SignaturePoint): number {
  return Math.sqrt(
    Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2)
  )
}

/**
 * 计算两点之间的角度
 */
export function getAngle(point1: SignaturePoint, point2: SignaturePoint): number {
  return Math.atan2(point2.y - point1.y, point2.x - point1.x)
}

/**
 * 获取控制点（用于贝塞尔曲线平滑）
 */
export function getControlPoint(
  current: SignaturePoint,
  previous: SignaturePoint,
  next: SignaturePoint,
  reverse?: boolean
): SignaturePoint {
  const p = previous || current
  const n = next || current
  const smoothing = 0.2
  const o = getAngle(p, n) * (reverse ? 1 : -1)
  const length = getDistance(p, n) * smoothing
  
  return {
    x: current.x + Math.cos(o) * length,
    y: current.y + Math.sin(o) * length,
    time: current.time
  }
}

/**
 * 根据速度计算画笔宽度（压感效果）
 */
export function calculateStrokeWidth(
  point1: SignaturePoint,
  point2: SignaturePoint,
  options: DrawOptions
): number {
  if (!options.pressure.enabled) {
    return options.strokeWidth
  }

  const distance = getDistance(point1, point2)
  const timeDiff = point2.time - point1.time
  const speed = timeDiff > 0 ? distance / timeDiff : 0

  // 速度越快，线条越细
  const speedFactor = Math.max(0.1, Math.min(1, 1 - speed * 0.01))
  const { min, max } = options.pressure
  
  return min + (max - min) * speedFactor
}

/**
 * 绘制平滑曲线
 */
export function drawSmoothPath(
  ctx: CanvasRenderingContext2D,
  points: SignaturePoint[],
  options: DrawOptions
): void {
  if (points.length < 2) return

  ctx.strokeStyle = options.strokeColor
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  if (!options.smoothing || points.length < 3) {
    // 直线绘制
    ctx.beginPath()
    ctx.lineWidth = options.strokeWidth
    ctx.moveTo(points[0].x, points[0].y)
    
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y)
    }
    ctx.stroke()
    return
  }

  // 平滑曲线绘制
  ctx.beginPath()
  ctx.moveTo(points[0].x, points[0].y)

  for (let i = 1; i < points.length - 1; i++) {
    const current = points[i]
    const next = points[i + 1]
    
    if (options.pressure.enabled) {
      ctx.lineWidth = calculateStrokeWidth(points[i - 1], current, options)
    } else {
      ctx.lineWidth = options.strokeWidth
    }

    const controlPoint = getControlPoint(current, points[i - 1], next)
    ctx.quadraticCurveTo(controlPoint.x, controlPoint.y, current.x, current.y)
  }

  // 绘制最后一段
  const lastPoint = points[points.length - 1]
  ctx.lineTo(lastPoint.x, lastPoint.y)
  ctx.stroke()
}

/**
 * 将签名数据转换为SVG格式
 */
export function signatureToSVG(data: SignatureData): string {
  const { canvasSize, paths } = data
  let svg = `<svg width="${canvasSize.width}" height="${canvasSize.height}" xmlns="http://www.w3.org/2000/svg">`
  
  paths.forEach(path => {
    if (path.points.length < 2) return
    
    let pathData = `M ${path.points[0].x} ${path.points[0].y}`
    
    for (let i = 1; i < path.points.length; i++) {
      pathData += ` L ${path.points[i].x} ${path.points[i].y}`
    }
    
    svg += `<path d="${pathData}" stroke="${path.strokeColor}" stroke-width="${path.strokeWidth}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`
  })
  
  svg += '</svg>'
  return svg
}

/**
 * 导出签名为指定格式
 */
export function exportSignature(
  canvas: HTMLCanvasElement,
  data: SignatureData,
  options: ExportOptions = { format: 'png' }
): string {
  const { format, quality = 0.9, size, backgroundColor } = options

  if (format === 'svg') {
    return signatureToSVG(data)
  }

  // 创建临时画布用于导出
  const exportCanvas = document.createElement('canvas')
  const exportCtx = exportCanvas.getContext('2d')!
  
  // 设置导出尺寸
  if (size) {
    exportCanvas.width = size.width
    exportCanvas.height = size.height
    
    // 缩放绘制
    const scaleX = size.width / canvas.width
    const scaleY = size.height / canvas.height
    exportCtx.scale(scaleX, scaleY)
  } else {
    exportCanvas.width = canvas.width
    exportCanvas.height = canvas.height
  }

  // 设置背景
  if (backgroundColor && backgroundColor !== 'transparent') {
    exportCtx.fillStyle = backgroundColor
    exportCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height)
  }

  // 绘制签名内容
  exportCtx.drawImage(canvas, 0, 0)

  // 根据格式导出
  switch (format) {
    case 'jpeg':
      return exportCanvas.toDataURL('image/jpeg', quality)
    case 'base64':
      return exportCanvas.toDataURL('image/png').split(',')[1]
    case 'png':
    default:
      return exportCanvas.toDataURL('image/png')
  }
}

/**
 * 从DataURL加载图片到画布
 */
export function loadImageToCanvas(
  canvas: HTMLCanvasElement,
  dataURL: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const ctx = canvas.getContext('2d')!
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      resolve()
    }
    img.onerror = reject
    img.src = dataURL
  })
}

/**
 * 检查签名数据是否为空
 */
export function isSignatureEmpty(data: SignatureData): boolean {
  return data.paths.length === 0 || data.paths.every(path => path.points.length === 0)
}

/**
 * 创建空的签名数据
 */
export function createEmptySignatureData(width: number, height: number): SignatureData {
  return {
    paths: [],
    canvasSize: { width, height },
    timestamp: Date.now(),
    isEmpty: true
  }
}

/**
 * 深拷贝签名数据
 */
export function cloneSignatureData(data: SignatureData): SignatureData {
  return JSON.parse(JSON.stringify(data))
}

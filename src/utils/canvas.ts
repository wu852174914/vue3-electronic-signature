import type { SignatureData } from '../types'

/**
 * 画布工具函数集合
 */

/**
 * 获取设备像素比
 */
export function getDevicePixelRatio(): number {
  return window.devicePixelRatio || 1
}

/**
 * 设置高清画布
 */
export function setupHighDPICanvas(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const ctx = canvas.getContext('2d')!
  const devicePixelRatio = getDevicePixelRatio()
  
  // 获取显示尺寸
  const displayWidth = canvas.clientWidth
  const displayHeight = canvas.clientHeight
  
  // 设置实际尺寸
  canvas.width = displayWidth * devicePixelRatio
  canvas.height = displayHeight * devicePixelRatio
  
  // 缩放上下文以匹配设备像素比
  ctx.scale(devicePixelRatio, devicePixelRatio)
  
  // 设置CSS尺寸
  canvas.style.width = displayWidth + 'px'
  canvas.style.height = displayHeight + 'px'
  
  return ctx
}

/**
 * 计算签名的边界框
 */
export function getSignatureBounds(data: SignatureData): {
  minX: number
  minY: number
  maxX: number
  maxY: number
  width: number
  height: number
} {
  if (data.paths.length === 0) {
    return {
      minX: 0,
      minY: 0,
      maxX: 0,
      maxY: 0,
      width: 0,
      height: 0
    }
  }
  
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  
  data.paths.forEach(path => {
    path.points.forEach(point => {
      minX = Math.min(minX, point.x)
      minY = Math.min(minY, point.y)
      maxX = Math.max(maxX, point.x)
      maxY = Math.max(maxY, point.y)
    })
  })
  
  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY
  }
}

/**
 * 裁剪签名到最小边界框
 */
export function cropSignature(
  canvas: HTMLCanvasElement,
  data: SignatureData,
  padding: number = 10
): HTMLCanvasElement {
  const bounds = getSignatureBounds(data)
  
  if (bounds.width === 0 || bounds.height === 0) {
    // 返回空画布
    const croppedCanvas = document.createElement('canvas')
    croppedCanvas.width = 1
    croppedCanvas.height = 1
    return croppedCanvas
  }
  
  // 创建裁剪后的画布
  const croppedCanvas = document.createElement('canvas')
  const croppedCtx = croppedCanvas.getContext('2d')!
  
  // 设置裁剪尺寸（包含padding）
  const cropWidth = bounds.width + padding * 2
  const cropHeight = bounds.height + padding * 2
  
  croppedCanvas.width = cropWidth
  croppedCanvas.height = cropHeight
  
  // 绘制裁剪后的内容
  croppedCtx.drawImage(
    canvas,
    bounds.minX - padding,
    bounds.minY - padding,
    cropWidth,
    cropHeight,
    0,
    0,
    cropWidth,
    cropHeight
  )
  
  return croppedCanvas
}

/**
 * 调整签名大小
 */
export function resizeSignature(
  canvas: HTMLCanvasElement,
  targetWidth: number,
  targetHeight: number,
  maintainAspectRatio: boolean = true
): HTMLCanvasElement {
  const resizedCanvas = document.createElement('canvas')
  const resizedCtx = resizedCanvas.getContext('2d')!
  
  let newWidth = targetWidth
  let newHeight = targetHeight
  
  if (maintainAspectRatio) {
    const aspectRatio = canvas.width / canvas.height
    const targetAspectRatio = targetWidth / targetHeight
    
    if (aspectRatio > targetAspectRatio) {
      // 原图更宽，以宽度为准
      newHeight = targetWidth / aspectRatio
    } else {
      // 原图更高，以高度为准
      newWidth = targetHeight * aspectRatio
    }
  }
  
  resizedCanvas.width = newWidth
  resizedCanvas.height = newHeight
  
  // 启用图像平滑
  resizedCtx.imageSmoothingEnabled = true
  resizedCtx.imageSmoothingQuality = 'high'
  
  // 绘制调整后的图像
  resizedCtx.drawImage(canvas, 0, 0, newWidth, newHeight)
  
  return resizedCanvas
}

/**
 * 添加水印到签名
 */
export function addWatermark(
  canvas: HTMLCanvasElement,
  watermarkText: string,
  options: {
    fontSize?: number
    fontFamily?: string
    color?: string
    opacity?: number
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center'
  } = {}
): HTMLCanvasElement {
  const {
    fontSize = 12,
    fontFamily = 'Arial',
    color = '#999',
    opacity = 0.5,
    position = 'bottom-right'
  } = options
  
  const watermarkedCanvas = document.createElement('canvas')
  const watermarkedCtx = watermarkedCanvas.getContext('2d')!
  
  watermarkedCanvas.width = canvas.width
  watermarkedCanvas.height = canvas.height
  
  // 绘制原始签名
  watermarkedCtx.drawImage(canvas, 0, 0)
  
  // 设置水印样式
  watermarkedCtx.font = `${fontSize}px ${fontFamily}`
  watermarkedCtx.fillStyle = color
  watermarkedCtx.globalAlpha = opacity
  
  // 计算水印位置
  const textMetrics = watermarkedCtx.measureText(watermarkText)
  const textWidth = textMetrics.width
  const textHeight = fontSize
  
  let x: number, y: number
  
  switch (position) {
    case 'top-left':
      x = 10
      y = textHeight + 10
      break
    case 'top-right':
      x = canvas.width - textWidth - 10
      y = textHeight + 10
      break
    case 'bottom-left':
      x = 10
      y = canvas.height - 10
      break
    case 'bottom-right':
      x = canvas.width - textWidth - 10
      y = canvas.height - 10
      break
    case 'center':
      x = (canvas.width - textWidth) / 2
      y = (canvas.height + textHeight) / 2
      break
    default:
      x = canvas.width - textWidth - 10
      y = canvas.height - 10
  }
  
  // 绘制水印
  watermarkedCtx.fillText(watermarkText, x, y)
  
  // 恢复透明度
  watermarkedCtx.globalAlpha = 1
  
  return watermarkedCanvas
}

/**
 * 将签名转换为灰度
 */
export function convertToGrayscale(canvas: HTMLCanvasElement): HTMLCanvasElement {
  const grayscaleCanvas = document.createElement('canvas')
  const grayscaleCtx = grayscaleCanvas.getContext('2d')!
  
  grayscaleCanvas.width = canvas.width
  grayscaleCanvas.height = canvas.height
  
  // 绘制原始图像
  grayscaleCtx.drawImage(canvas, 0, 0)
  
  // 获取图像数据
  const imageData = grayscaleCtx.getImageData(0, 0, canvas.width, canvas.height)
  const data = imageData.data
  
  // 转换为灰度
  for (let i = 0; i < data.length; i += 4) {
    const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114
    data[i] = gray     // Red
    data[i + 1] = gray // Green
    data[i + 2] = gray // Blue
    // Alpha channel (data[i + 3]) remains unchanged
  }
  
  // 将修改后的数据放回画布
  grayscaleCtx.putImageData(imageData, 0, 0)
  
  return grayscaleCanvas
}

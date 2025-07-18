import type { App } from 'vue'
import ElectronicSignature from './components/ElectronicSignature.vue'

// 导出组件
export { ElectronicSignature }

// 导出类型
export type {
  SignatureProps,
  SignaturePoint,
  SignaturePath,
  SignatureData,
  ExportFormat,
  ExportOptions,
  SignatureEvents,
  SignatureMethods,
  TouchEventType,
  DrawOptions,
  PenStyle,
  PenStyleConfig,
  SignatureReplay,
  ReplayOptions,
  ReplayState
} from './types'

// 导出工具函数
export {
  getDistance,
  getAngle,
  getControlPoint,
  calculateStrokeWidth,
  drawSmoothPath,
  signatureToSVG,
  exportSignature,
  loadImageToCanvas,
  isSignatureEmpty,
  createEmptySignatureData,
  cloneSignatureData
} from './utils/signature'

// 导出画布工具函数
export {
  getDevicePixelRatio,
  setupHighDPICanvas,
  getSignatureBounds,
  cropSignature,
  resizeSignature,
  addWatermark,
  convertToGrayscale
} from './utils/canvas'

// 导出笔迹样式工具函数
export {
  getPenStyleConfig,
  getAllPenStyles,
  createDrawOptionsFromPenStyle,
  PEN_STYLE_CONFIGS
} from './utils/penStyles'

// 导出回放相关工具函数
export {
  SignatureReplayController,
  createReplayData
} from './utils/replay'

// 插件安装函数
const install = (app: App): void => {
  app.component('ElectronicSignature', ElectronicSignature)
}

// 默认导出（支持 Vue.use() 方式安装）
export default {
  install,
  ElectronicSignature
} as any

// 版本信息
export const version = '1.0.0'

import { default as ElectronicSignature } from './components/ElectronicSignature.vue';

export { ElectronicSignature };
export type { SignatureProps, SignaturePoint, SignaturePath, SignatureData, ExportFormat, ExportOptions, SignatureEvents, SignatureMethods, TouchEventType, DrawOptions, PenStyle, PenStyleConfig, SignatureReplay, ReplayOptions, ReplayState } from './types';
export { getDistance, getAngle, getControlPoint, calculateStrokeWidth, drawSmoothPath, signatureToSVG, exportSignature, loadImageToCanvas, isSignatureEmpty, createEmptySignatureData, cloneSignatureData } from './utils/signature';
export { getDevicePixelRatio, setupHighDPICanvas, getSignatureBounds, cropSignature, resizeSignature, addWatermark, convertToGrayscale } from './utils/canvas';
export { getPenStyleConfig, getAllPenStyles, createDrawOptionsFromPenStyle, PEN_STYLE_CONFIGS } from './utils/penStyles';
export { SignatureReplayController, createReplayData } from './utils/replay';
declare const _default: any;
export default _default;
export declare const version = "1.0.0";
//# sourceMappingURL=index.d.ts.map
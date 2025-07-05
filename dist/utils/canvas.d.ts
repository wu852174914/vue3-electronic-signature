import { SignatureData } from '../types';

/**
 * 画布工具函数集合
 */
/**
 * 获取设备像素比
 */
export declare function getDevicePixelRatio(): number;
/**
 * 设置高清画布
 */
export declare function setupHighDPICanvas(canvas: HTMLCanvasElement): CanvasRenderingContext2D;
/**
 * 计算签名的边界框
 */
export declare function getSignatureBounds(data: SignatureData): {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
    width: number;
    height: number;
};
/**
 * 裁剪签名到最小边界框
 */
export declare function cropSignature(canvas: HTMLCanvasElement, data: SignatureData, padding?: number): HTMLCanvasElement;
/**
 * 调整签名大小
 */
export declare function resizeSignature(canvas: HTMLCanvasElement, targetWidth: number, targetHeight: number, maintainAspectRatio?: boolean): HTMLCanvasElement;
/**
 * 添加水印到签名
 */
export declare function addWatermark(canvas: HTMLCanvasElement, watermarkText: string, options?: {
    fontSize?: number;
    fontFamily?: string;
    color?: string;
    opacity?: number;
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
}): HTMLCanvasElement;
/**
 * 将签名转换为灰度
 */
export declare function convertToGrayscale(canvas: HTMLCanvasElement): HTMLCanvasElement;
//# sourceMappingURL=canvas.d.ts.map
import { SignaturePoint, SignatureData, ExportOptions, DrawOptions } from '../types';

/**
 * 计算两点之间的距离
 */
export declare function getDistance(point1: SignaturePoint, point2: SignaturePoint): number;
/**
 * 计算两点之间的角度
 */
export declare function getAngle(point1: SignaturePoint, point2: SignaturePoint): number;
/**
 * 获取控制点（用于贝塞尔曲线平滑）
 */
export declare function getControlPoint(current: SignaturePoint, previous: SignaturePoint, next: SignaturePoint, reverse?: boolean): SignaturePoint;
/**
 * 根据速度计算画笔宽度（压感效果）
 */
export declare function calculateStrokeWidth(point1: SignaturePoint, point2: SignaturePoint, options: DrawOptions): number;
/**
 * 绘制平滑曲线
 */
export declare function drawSmoothPath(ctx: CanvasRenderingContext2D, points: SignaturePoint[], options: DrawOptions): void;
/**
 * 将签名数据转换为SVG格式
 */
export declare function signatureToSVG(data: SignatureData): string;
/**
 * 导出签名为指定格式
 */
export declare function exportSignature(canvas: HTMLCanvasElement, data: SignatureData, options?: ExportOptions): string;
/**
 * 从DataURL加载图片到画布
 */
export declare function loadImageToCanvas(canvas: HTMLCanvasElement, dataURL: string): Promise<void>;
/**
 * 检查签名数据是否为空
 */
export declare function isSignatureEmpty(data: SignatureData): boolean;
/**
 * 创建空的签名数据
 */
export declare function createEmptySignatureData(width: number, height: number): SignatureData;
/**
 * 深拷贝签名数据
 */
export declare function cloneSignatureData(data: SignatureData): SignatureData;
//# sourceMappingURL=signature.d.ts.map
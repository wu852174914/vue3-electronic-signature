import { SignatureReplay, SignatureData, ReplayState, ReplayOptions, ReplayController } from '../types';

/**
 * 签名回放控制器
 */
export declare class SignatureReplayController implements ReplayController {
    private canvas;
    private ctx;
    private replayData;
    private state;
    private currentTime;
    private speed;
    private animationId;
    private startTimestamp;
    private pausedTime;
    private options;
    private eventCallbacks;
    private offscreenCanvas;
    private offscreenCtx;
    private lastFrameImageBitmap;
    private renderThrottle;
    private isRendering;
    private seededRandom;
    constructor(canvas: HTMLCanvasElement);
    /**
     * 创建确定性随机数生成器（解决毛笔等笔迹的闪烁问题）
     * 基于简单的线性同余生成器（LCG）算法
     */
    private createSeededRandom;
    /**
     * 初始化离屏画布用于性能优化
     */
    private initializeOffscreenCanvas;
    /**
     * 设置回放数据
     */
    setReplayData(data: SignatureReplay, options?: ReplayOptions): void;
    /**
     * 重置优化状态
     */
    private resetOptimizationState;
    /**
     * 开始播放
     */
    play(): void;
    /**
     * 暂停播放
     */
    pause(): void;
    /**
     * 停止播放
     */
    stop(): void;
    /**
     * 跳转到指定时间
     */
    seek(time: number): void;
    /**
     * 设置播放速度
     */
    setSpeed(speed: number): void;
    /**
     * 获取当前状态
     */
    getState(): ReplayState;
    /**
     * 获取当前时间
     */
    getCurrentTime(): number;
    /**
     * 获取总时长
     */
    getTotalDuration(): number;
    /**
     * 获取当前进度（0-1）
     */
    getProgress(): number;
    /**
     * 动画循环
     */
    private animate;
    /**
     * 渲染指定时间的帧 - 高性能优化版本
     */
    private renderFrame;
    /**
     * 高效地将离屏画布内容传输到主画布（同步版本）
     */
    private transferToMainCanvasSync;
    /**
     * 在离屏画布上渲染完整帧
     */
    private renderToOffscreenCanvas;
    /**
     * 获取指定时间内的所有点
     */
    private getPointsUpToTime;
    /**
     * 根据笔迹样式计算动态线宽（与录制时一致）
     */
    private calculateDynamicStrokeWidth;
    /**
     * 根据笔迹样式绘制线段（与录制时完全一致）
     */
    private drawStyledStrokeForReplay;
    /**
     * 绘制优雅笔迹 - 基于Fabric.js和Vue3-Signature-Pad的速度压力感应技术
     */
    private drawElegantStroke;
    /**
     * 预处理点数据，计算速度和动态线宽 - 基于Vue3-Signature-Pad算法
     */
    private preprocessPointsForVelocity;
    /**
     * 基于速度的路径绘制 - 使用Fabric.js的平滑算法
     */
    private drawVelocityBasedPath;
    /**
     * 绘制基于速度的单个线段 - 实现由粗到细的渐变
     */
    private drawVelocitySegment;
    /**
     * 基于速度变化的智能连接 - 优化连笔效果
     */
    private addVelocityBasedConnections;
    /**
     * 平滑插值函数 - 基于Paper.js的平滑算法
     */
    private smoothStep;
    /**
     * 获取控制点（用于贝塞尔曲线平滑） - 与signature.ts中的实现一致
     */
    private getControlPoint;
    /**
     * 清除画布
     */
    private clearCanvas;
    /**
     * 注册事件监听器
     */
    on(event: string, callback: Function): void;
    /**
     * 移除事件监听器
     */
    off(event: string, callback?: Function): void;
    /**
     * 触发事件
     */
    private emit;
    /**
     * 在离屏画布上绘制完整路径
     */
    private drawCompletePathToOffscreen;
    /**
     * 在离屏画布上绘制部分路径
     */
    private drawPartialPathToOffscreen;
    /**
     * 销毁控制器
     */
    destroy(): void;
}
/**
 * 从签名数据生成回放数据
 */
export declare function createReplayData(signatureData: SignatureData): SignatureReplay;
//# sourceMappingURL=replay.d.ts.map
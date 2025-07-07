import { PenStyle, PenStyleConfig } from '../types';

/**
 * 预设的笔迹样式配置
 */
export declare const PEN_STYLE_CONFIGS: Record<PenStyle, PenStyleConfig>;
/**
 * 获取笔迹样式配置
 */
export declare function getPenStyleConfig(style: PenStyle): PenStyleConfig;
/**
 * 获取所有可用的笔迹样式
 */
export declare function getAllPenStyles(): Array<{
    key: PenStyle;
    config: PenStyleConfig;
}>;
/**
 * 根据笔迹样式生成绘制选项
 */
export declare function createDrawOptionsFromPenStyle(style: PenStyle, customColor?: string): {
    strokeWidth: number;
    smoothing: boolean;
    pressure: {
        enabled: boolean;
        min: number;
        max: number;
    };
    lineCap: CanvasLineCap;
    lineJoin: CanvasLineJoin;
    strokeColor: string;
};
//# sourceMappingURL=penStyles.d.ts.map
import { SignatureProps, SignaturePath, SignatureData, ExportOptions, SignatureReplay, ReplayOptions, ReplayState } from '../types';

interface ElectronicSignatureProps extends SignatureProps {
    showToolbar?: boolean;
}
declare const _default: import('vue').DefineComponent<import('vue').ExtractPropTypes<__VLS_WithDefaults<__VLS_TypePropsToRuntimeProps<ElectronicSignatureProps>, {
    width: string;
    height: number;
    strokeColor: string;
    strokeWidth: number;
    backgroundColor: string;
    disabled: boolean;
    placeholder: string;
    smoothing: boolean;
    pressureSensitive: boolean;
    minStrokeWidth: number;
    maxStrokeWidth: number;
    borderStyle: string;
    borderRadius: string;
    showToolbar: boolean;
}>>, {
    clear(): void;
    undo(): void;
    redo(): void;
    save(options?: ExportOptions): string;
    isEmpty(): boolean;
    fromDataURL(dataURL: string): void;
    getSignatureData(): SignatureData;
    setSignatureData(data: SignatureData): void;
    resize(width?: number, height?: number): void;
    startReplay(replayData: SignatureReplay, options?: ReplayOptions): void;
    getReplayData(): SignatureReplay | null;
    setReplayMode(enabled: boolean): void;
    play(): void;
    pause(): void;
    stop(): void;
    seek(time: number): void;
    setSpeed(speed: number): void;
    getState(): ReplayState;
    getCurrentTime(): number;
    getTotalDuration(): number;
    getProgress(): number;
}, {}, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {
    "replay-resume": () => void;
    "replay-start": () => void;
    "replay-pause": () => void;
    "replay-stop": () => void;
    "replay-speed-change": (speed: number) => void;
    "replay-complete": () => void;
    "replay-progress": (progress: number, currentTime: number) => void;
    "replay-path-end": (pathIndex: number, path: SignaturePath) => void;
    "replay-path-start": (pathIndex: number, path: SignaturePath) => void;
    "signature-start": () => void;
    "signature-drawing": (data: SignatureData) => void;
    "signature-end": (data: SignatureData) => void;
    "signature-clear": () => void;
    "signature-undo": (data: SignatureData) => void;
    "signature-redo": (data: SignatureData) => void;
}, string, import('vue').PublicProps, Readonly<import('vue').ExtractPropTypes<__VLS_WithDefaults<__VLS_TypePropsToRuntimeProps<ElectronicSignatureProps>, {
    width: string;
    height: number;
    strokeColor: string;
    strokeWidth: number;
    backgroundColor: string;
    disabled: boolean;
    placeholder: string;
    smoothing: boolean;
    pressureSensitive: boolean;
    minStrokeWidth: number;
    maxStrokeWidth: number;
    borderStyle: string;
    borderRadius: string;
    showToolbar: boolean;
}>>> & Readonly<{
    "onReplay-resume"?: (() => any) | undefined;
    "onReplay-start"?: (() => any) | undefined;
    "onReplay-pause"?: (() => any) | undefined;
    "onReplay-stop"?: (() => any) | undefined;
    "onReplay-speed-change"?: ((speed: number) => any) | undefined;
    "onReplay-complete"?: (() => any) | undefined;
    "onReplay-progress"?: ((progress: number, currentTime: number) => any) | undefined;
    "onReplay-path-end"?: ((pathIndex: number, path: SignaturePath) => any) | undefined;
    "onReplay-path-start"?: ((pathIndex: number, path: SignaturePath) => any) | undefined;
    "onSignature-start"?: (() => any) | undefined;
    "onSignature-drawing"?: ((data: SignatureData) => any) | undefined;
    "onSignature-end"?: ((data: SignatureData) => any) | undefined;
    "onSignature-clear"?: (() => any) | undefined;
    "onSignature-undo"?: ((data: SignatureData) => any) | undefined;
    "onSignature-redo"?: ((data: SignatureData) => any) | undefined;
}>, {
    backgroundColor: string;
    strokeColor: string;
    strokeWidth: number;
    smoothing: boolean;
    showToolbar: boolean;
    width: number | string;
    height: number | string;
    disabled: boolean;
    placeholder: string;
    pressureSensitive: boolean;
    minStrokeWidth: number;
    maxStrokeWidth: number;
    borderStyle: string;
    borderRadius: string;
}, {}, {}, {}, string, import('vue').ComponentProvideOptions, true, {}, any>;
export default _default;
type __VLS_NonUndefinedable<T> = T extends undefined ? never : T;
type __VLS_TypePropsToRuntimeProps<T> = {
    [K in keyof T]-?: {} extends Pick<T, K> ? {
        type: import('vue').PropType<__VLS_NonUndefinedable<T[K]>>;
    } : {
        type: import('vue').PropType<T[K]>;
        required: true;
    };
};
type __VLS_WithDefaults<P, D> = {
    [K in keyof Pick<P, keyof P>]: K extends keyof D ? __VLS_Prettify<P[K] & {
        default: D[K];
    }> : P[K];
};
type __VLS_Prettify<T> = {
    [K in keyof T]: T[K];
} & {};
//# sourceMappingURL=ElectronicSignature.vue.d.ts.map
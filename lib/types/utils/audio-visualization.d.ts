export default class AudioVisualization {
    #private;
    static sourceNode: MediaElementAudioSourceNode | null;
    static audioContext: AudioContext | null;
    static buffer: Uint8Array<ArrayBuffer> | null;
    static analyser: AnalyserNode | null;
    static container: HTMLElement;
    static targetAudio: HTMLAudioElement;
    static canvas: HTMLCanvasElement;
    static ctx: CanvasRenderingContext2D | null;
    static isInit: boolean;
    static create(deviceId: string, targetAudio: HTMLAudioElement, targetContainer: string | HTMLElement | null): Promise<typeof AudioVisualization>;
    static setSinkId(deviceId: string): Promise<unknown>;
    static updateTargetAudio(audio: HTMLAudioElement): void;
    static start(): void;
    static stop(): void;
}

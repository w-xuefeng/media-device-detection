/// <reference types="use-types" />
export interface ICameraInfo extends MediaTrackCapabilities {
    InputDeviceInfo: MediaDeviceInfo;
}
export interface IMediaDeviceDetectionOptions {
    onGetCameraError: (error: Error) => void;
    onGetMicrophoneError: (error: Error) => void;
    onGetAudioOutputError: (error: Error) => void;
}
export default class MediaDeviceDetection {
    audioContext: useTypes.data.Nullable<AudioContext>;
    audioWorkletNode: useTypes.data.Nullable<AudioWorkletNode>;
    micStream: useTypes.data.Nullable<MediaStream>;
    micStreamSource: useTypes.data.Nullable<MediaStreamAudioSourceNode>;
    onGetCameraError: IMediaDeviceDetectionOptions["onGetCameraError"];
    onGetMicrophoneError: IMediaDeviceDetectionOptions["onGetMicrophoneError"];
    onGetAudioOutputError: IMediaDeviceDetectionOptions["onGetAudioOutputError"];
    constructor(options?: Partial<IMediaDeviceDetectionOptions>);
    /**
     * 获取摄像头列表
     */
    getCameraList(): Promise<ICameraInfo[]>;
    /**
     * 获取摄像头支持的分辨率
     */
    getResolution(device: ICameraInfo): {
        label: string;
        width: number;
        height: number;
        ratio: string;
    }[];
    /**
     * 获取麦克风列表
     */
    getMicrophoneList(): Promise<MediaDeviceInfo[]>;
    /**
     * 获取扬声器设备列表
     */
    getAudioOutputDeviceList(): Promise<MediaDeviceInfo[]>;
    /**
     * 测试麦克风。将触发 volume-change 事件，带出音量值 [0-100]
     */
    testMicrophone(deviceId: string): Promise<void>;
    closeCurrentMicrophone(): void;
    /**
     * 解除麦克风的占用
     */
    releaseMicrophone(): void;
}

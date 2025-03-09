import MediaDeviceDetection, { type ICameraInfo, type IMediaDeviceDetectionOptions } from "./media-device-detection";
export interface IMicrophoneInfo extends MediaDeviceInfo {
    extraDeviceId?: string;
    extraLabel?: string;
}
export interface IAudioOutputDeviceInfo extends MediaDeviceInfo {
    extraDeviceId?: string;
    extraLabel?: string;
}
export interface IUseMediaDeviceDetectionOptions {
    video: boolean;
    audio: boolean;
    onVolumeChange?(e: CustomEvent<number>): void;
    onCameraListReady?(e: ICameraInfo[]): void;
    onMicrophoneListReady?(e: IMicrophoneInfo[]): void;
    onAudioOutputListReady?(e: IAudioOutputDeviceInfo[]): void;
    mediaDeviceDetectionOptions?: Partial<IMediaDeviceDetectionOptions>;
}
export declare function useMediaDeviceDetection(options?: IUseMediaDeviceDetectionOptions): {
    cameraList: {
        value: ICameraInfo[];
    };
    microphoneList: {
        value: IMicrophoneInfo[];
    };
    audioOutputList: {
        value: IAudioOutputDeviceInfo[];
    };
    mediaDeviceDetection: MediaDeviceDetection;
    release: (streams?: (MediaStream | undefined | null)[]) => void;
    releaseMicrophone: () => void;
    releaseStream: (stream?: MediaStream | null) => void;
};

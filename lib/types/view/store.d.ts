import MediaDeviceDetection, { type ICameraInfo } from "../core/media-device-detection";
import { type IAudioOutputDeviceInfo, type IMicrophoneInfo } from "../core/use-media-device-detection";
export declare const prefix = "media-device-detection-";
export declare const dialogContainerName: string;
export declare const panelContainerName: string;
export declare const dialogStyle: string;
export declare const panelStyle: string;
export declare const globalStore: {
    currentIds: {
        camera: string;
        microphone: string;
        audioOutput: string;
    };
    permission: {
        camera: boolean;
        microphone: boolean;
        audioOutput: boolean;
    };
    currentCamera: ICameraInfo;
    currentCameraStream: MediaStream;
    currentMicrophone: IMicrophoneInfo;
    currentAudioOutputDevice: IAudioOutputDeviceInfo;
    cameraVideoRef: HTMLVideoElement;
    volumeRef: HTMLElement;
    audioRef: HTMLAudioElement;
    currentAudioOutputStream: MediaStream;
    microphoneHasVoice: boolean;
    audioPaused: boolean;
    microphoneList: IMicrophoneInfo[];
    cameraList: ICameraInfo[];
    audioOutputList: IAudioOutputDeviceInfo[];
    mediaDeviceDetection: MediaDeviceDetection;
    audioOutputDetectionMusic: string;
}, onStoreChange: (property: "currentIds" | "permission" | "microphoneHasVoice" | "audioPaused" | "audioOutputDetectionMusic" | "currentCamera" | "currentCameraStream" | "currentMicrophone" | "currentAudioOutputDevice" | "cameraVideoRef" | "volumeRef" | "audioRef" | "currentAudioOutputStream" | "microphoneList" | "cameraList" | "audioOutputList" | "mediaDeviceDetection", callback: ((newValue: unknown, oldValue: unknown, newObject: {
    currentIds: {
        camera: string;
        microphone: string;
        audioOutput: string;
    };
    permission: {
        camera: boolean;
        microphone: boolean;
        audioOutput: boolean;
    };
    currentCamera: ICameraInfo;
    currentCameraStream: MediaStream;
    currentMicrophone: IMicrophoneInfo;
    currentAudioOutputDevice: IAudioOutputDeviceInfo;
    cameraVideoRef: HTMLVideoElement;
    volumeRef: HTMLElement;
    audioRef: HTMLAudioElement;
    currentAudioOutputStream: MediaStream;
    microphoneHasVoice: boolean;
    audioPaused: boolean;
    microphoneList: IMicrophoneInfo[];
    cameraList: ICameraInfo[];
    audioOutputList: IAudioOutputDeviceInfo[];
    mediaDeviceDetection: MediaDeviceDetection;
    audioOutputDetectionMusic: string;
}, changedProperty: string | symbol) => void | Promise<void>) & {
    watchProperties?: (string | symbol)[];
}, once?: boolean) => void;
export declare const methodsStore: {
    release: () => void;
    releaseStream: (stream?: MediaStream) => void;
};
export type TGlobalStore = typeof globalStore;

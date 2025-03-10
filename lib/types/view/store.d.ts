import MediaDeviceDetection, { type ICameraInfo } from "../core/media-device-detection";
import { type IAudioOutputDeviceInfo, type IMicrophoneInfo } from "../core/use-media-device-detection";
export declare const prefix = "media-device-detection-";
export declare const dialogContainerName = "media-device-detection-dialog";
export declare const panelContainerName = "media-device-detection-panel";
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
    currentCamera: useTypes.data.Nullable<ICameraInfo>;
    currentCameraStream: useTypes.data.Nullable<MediaStream>;
    currentMicrophone: useTypes.data.Nullable<IMicrophoneInfo>;
    currentAudioOutputDevice: useTypes.data.Nullable<IAudioOutputDeviceInfo>;
    cameraVideoRef: useTypes.data.Nullable<HTMLVideoElement>;
    volumeRef: useTypes.data.Nullable<HTMLElement>;
    audioRef: useTypes.data.Nullable<HTMLAudioElement>;
    currentAudioOutputStream: useTypes.data.Nullable<MediaStream>;
    microphoneHasVoice: boolean;
    audioPaused: boolean;
    microphoneList: IMicrophoneInfo[];
    cameraList: ICameraInfo[];
    audioOutputList: IAudioOutputDeviceInfo[];
    mediaDeviceDetection: useTypes.data.Nullable<MediaDeviceDetection>;
    audioOutputDetectionMusic: string;
}, onStoreChange: (properties: "label" | "forEach" | "addEventListener" | "removeEventListener" | "id" | "dispatchEvent" | "close" | "suspend" | "aspectRatio" | "height" | "width" | "InputDeviceInfo" | "extraDeviceId" | "extraLabel" | "onGetCameraError" | "onGetMicrophoneError" | "onGetAudioOutputError" | "camera" | "microphone" | "deviceId" | "echoCancellation" | "autoGainControl" | "backgroundBlur" | "channelCount" | "displaySurface" | "facingMode" | "frameRate" | "groupId" | "noiseSuppression" | "sampleRate" | "sampleSize" | "kind" | "toJSON" | "value" | "currentIds" | "permission" | "microphoneHasVoice" | "audioPaused" | "audioOutputDetectionMusic" | "active" | "onaddtrack" | "onremovetrack" | "addTrack" | "clone" | "getAudioTracks" | "getTrackById" | "getTracks" | "getVideoTracks" | "removeTrack" | "currentCamera" | "currentCameraStream" | "currentMicrophone" | "currentAudioOutputDevice" | "cameraVideoRef" | "volumeRef" | "audioRef" | "currentAudioOutputStream" | "microphoneList" | "cameraList" | "audioOutputList" | "mediaDeviceDetection" | "audioOutput" | "max" | "min" | "audioContext" | "audioWorkletNode" | "micStream" | "micStreamSource" | "watchPermissions" | "getCameraList" | "getResolution" | "getMicrophoneList" | "getAudioOutputDeviceList" | "testMicrophone" | "closeCurrentMicrophone" | "releaseMicrophone" | "baseLatency" | "outputLatency" | "createMediaElementSource" | "createMediaStreamDestination" | "createMediaStreamSource" | "getOutputTimestamp" | "resume" | "audioWorklet" | "currentTime" | "destination" | "listener" | "onstatechange" | "state" | "createAnalyser" | "createBiquadFilter" | "createBuffer" | "createBufferSource" | "createChannelMerger" | "createChannelSplitter" | "createConstantSource" | "createConvolver" | "createDelay" | "createDynamicsCompressor" | "createGain" | "createIIRFilter" | "createOscillator" | "createPanner" | "createPeriodicWave" | "createScriptProcessor" | "createStereoPanner" | "createWaveShaper" | "decodeAudioData" | "addModule" | "forwardX" | "forwardY" | "forwardZ" | "positionX" | "positionY" | "positionZ" | "upX" | "upY" | "upZ" | "setOrientation" | "setPosition" | "automationRate" | "defaultValue" | "maxValue" | "minValue" | "cancelAndHoldAtTime" | "cancelScheduledValues" | "exponentialRampToValueAtTime" | "linearRampToValueAtTime" | "setTargetAtTime" | "setValueAtTime" | "setValueCurveAtTime" | "onprocessorerror" | "parameters" | "port" | "channelCountMode" | "channelInterpretation" | "context" | "numberOfInputs" | "numberOfOutputs" | "connect" | "disconnect" | "postMessage" | "start" | "onmessage" | "onmessageerror" | "mediaStream" | ("label" | "forEach" | "addEventListener" | "removeEventListener" | "id" | "dispatchEvent" | "close" | "suspend" | "aspectRatio" | "height" | "width" | "InputDeviceInfo" | "extraDeviceId" | "extraLabel" | "onGetCameraError" | "onGetMicrophoneError" | "onGetAudioOutputError" | "camera" | "microphone" | "deviceId" | "echoCancellation" | "autoGainControl" | "backgroundBlur" | "channelCount" | "displaySurface" | "facingMode" | "frameRate" | "groupId" | "noiseSuppression" | "sampleRate" | "sampleSize" | "kind" | "toJSON" | "value" | "currentIds" | "permission" | "microphoneHasVoice" | "audioPaused" | "audioOutputDetectionMusic" | "active" | "onaddtrack" | "onremovetrack" | "addTrack" | "clone" | "getAudioTracks" | "getTrackById" | "getTracks" | "getVideoTracks" | "removeTrack" | "currentCamera" | "currentCameraStream" | "currentMicrophone" | "currentAudioOutputDevice" | "cameraVideoRef" | "volumeRef" | "audioRef" | "currentAudioOutputStream" | "microphoneList" | "cameraList" | "audioOutputList" | "mediaDeviceDetection" | "audioOutput" | "max" | "min" | "audioContext" | "audioWorkletNode" | "micStream" | "micStreamSource" | "watchPermissions" | "getCameraList" | "getResolution" | "getMicrophoneList" | "getAudioOutputDeviceList" | "testMicrophone" | "closeCurrentMicrophone" | "releaseMicrophone" | "baseLatency" | "outputLatency" | "createMediaElementSource" | "createMediaStreamDestination" | "createMediaStreamSource" | "getOutputTimestamp" | "resume" | "audioWorklet" | "currentTime" | "destination" | "listener" | "onstatechange" | "state" | "createAnalyser" | "createBiquadFilter" | "createBuffer" | "createBufferSource" | "createChannelMerger" | "createChannelSplitter" | "createConstantSource" | "createConvolver" | "createDelay" | "createDynamicsCompressor" | "createGain" | "createIIRFilter" | "createOscillator" | "createPanner" | "createPeriodicWave" | "createScriptProcessor" | "createStereoPanner" | "createWaveShaper" | "decodeAudioData" | "addModule" | "forwardX" | "forwardY" | "forwardZ" | "positionX" | "positionY" | "positionZ" | "upX" | "upY" | "upZ" | "setOrientation" | "setPosition" | "automationRate" | "defaultValue" | "maxValue" | "minValue" | "cancelAndHoldAtTime" | "cancelScheduledValues" | "exponentialRampToValueAtTime" | "linearRampToValueAtTime" | "setTargetAtTime" | "setValueAtTime" | "setValueCurveAtTime" | "onprocessorerror" | "parameters" | "port" | "channelCountMode" | "channelInterpretation" | "context" | "numberOfInputs" | "numberOfOutputs" | "connect" | "disconnect" | "postMessage" | "start" | "onmessage" | "onmessageerror" | "mediaStream")[], callback: ((newValue: unknown, oldValue: unknown, newObject: {
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
    currentCamera: useTypes.data.Nullable<ICameraInfo>;
    currentCameraStream: useTypes.data.Nullable<MediaStream>;
    currentMicrophone: useTypes.data.Nullable<IMicrophoneInfo>;
    currentAudioOutputDevice: useTypes.data.Nullable<IAudioOutputDeviceInfo>;
    cameraVideoRef: useTypes.data.Nullable<HTMLVideoElement>;
    volumeRef: useTypes.data.Nullable<HTMLElement>;
    audioRef: useTypes.data.Nullable<HTMLAudioElement>;
    currentAudioOutputStream: useTypes.data.Nullable<MediaStream>;
    microphoneHasVoice: boolean;
    audioPaused: boolean;
    microphoneList: IMicrophoneInfo[];
    cameraList: ICameraInfo[];
    audioOutputList: IAudioOutputDeviceInfo[];
    mediaDeviceDetection: useTypes.data.Nullable<MediaDeviceDetection>;
    audioOutputDetectionMusic: string;
}, changedProperty: string | symbol) => void | Promise<void>) & {
    watchProperties?: (string | symbol)[];
}, once?: boolean) => void, cleanStoreEvent: () => void;
export declare const methodsStore: {
    release: () => void;
    releaseStream: (stream?: MediaStream) => void;
};
export type TGlobalStore = typeof globalStore;

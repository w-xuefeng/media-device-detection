import MediaDeviceDetection, {
  type ICameraInfo,
} from "../../core/media-device-detection";
import {
  type IAudioOutputDeviceInfo,
  type IMicrophoneInfo,
} from "../../core/use-media-device-detection";
import { watchObject } from "../../utils";
import style from "./style";

export const prefix = "media-device-detection-";
export const dialogContainerName = `${prefix}dialog`;
export const panelContainerName = `${prefix}panel`;

export const dialogStyle = style.dialog;
export const panelStyle = style.panel;

export const EVENTS = {
  CLOSE: "close",
  CANCEL: "cancel",
  CONFIRM: "confirm",
  VOLUME_CHANGE: "volumeChange",
  GET_CAMERA_ERROR: "getCameraError",
  GET_MICROPHONE_ERROR: "getMicrophoneError",
  GET_AUDIO_OUTPUT_ERROR: "getAudioOutputError",
  CAMERA_LIST_READY: "cameraListReady",
  MICROPHONE_LIST_READY: "microphoneListReady",
  AUDIO_OUTPUT_LIST_READY: "audioOutputListReady",
};

export const {
  value: globalStore,
  onChange: onStoreChange,
  clean: cleanStoreEvent,
  internalParentKey: IPK,
} = watchObject(
  {
    currentIds: {
      camera: "",
      microphone: "",
      audioOutput: "",
    },
    permission: {
      camera: true,
      microphone: true,
      audioOutput: true,
    },
    currentCamera: null as useTypes.data.Nullable<ICameraInfo>,
    currentCameraStream: null as useTypes.data.Nullable<MediaStream>,
    currentMicrophone: null as useTypes.data.Nullable<IMicrophoneInfo>,
    currentAudioOutputDevice:
      null as useTypes.data.Nullable<IAudioOutputDeviceInfo>,
    cameraVideoRef: null as useTypes.data.Nullable<HTMLVideoElement>,
    volumeRef: null as useTypes.data.Nullable<HTMLElement>,
    audioRef: null as useTypes.data.Nullable<HTMLAudioElement>,
    audioOutputVisualizationContainer:
      null as useTypes.data.Nullable<HTMLDivElement>,
    microphoneHasVoice: false,
    audioPaused: true,
    microphoneList: [] as IMicrophoneInfo[],
    cameraList: [] as ICameraInfo[],
    audioOutputList: [] as IAudioOutputDeviceInfo[],
    mediaDeviceDetection: null as useTypes.data.Nullable<MediaDeviceDetection>,
    audioOutputDetectionMusic: "",
  },
  {
    deep: true,
    excludeType: [MediaStream, HTMLElement, MediaDeviceDetection],
  }
);

export const methodsStore = {
  release: () => {},
  releaseStream: (stream?: MediaStream) => {},
};

export type TGlobalStore = typeof globalStore;

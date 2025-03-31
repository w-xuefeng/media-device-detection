import MediaDeviceDetection, {
  type ICameraInfo,
  type IMediaDeviceDetectionOptions,
} from "./media-device-detection";
import { throttle } from "../utils";
import CGF from "./config";

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

export function useMediaDeviceDetection(
  options?: IUseMediaDeviceDetectionOptions
) {
  const cameraList = {
    value: [] as ICameraInfo[],
  };
  const microphoneList = {
    value: [] as IMicrophoneInfo[],
  };
  const audioOutputList = {
    value: [] as IAudioOutputDeviceInfo[],
  };

  const mediaDeviceDetection = new MediaDeviceDetection(
    options?.mediaDeviceDetectionOptions
  );

  const throttleVolumeChange = throttle(
    (e: Event) => {
      options?.onVolumeChange?.(e as CustomEvent<number>);
    },
    50,
    { trailing: true }
  );

  function onVolumeChange(e: Event) {
    throttleVolumeChange(e);
  }

  function releaseMicrophone() {
    mediaDeviceDetection.releaseMicrophone();
    globalThis.removeEventListener(CGF.volumeChangeEventName, onVolumeChange);
  }

  function releaseStream(stream?: MediaStream | null) {
    stream?.getTracks().forEach((e) => e.stop());
  }

  function release(streams?: (MediaStream | undefined | null)[]) {
    releaseMicrophone();
    streams?.forEach((e) => releaseStream(e));
  }

  function init() {
    globalThis.addEventListener(CGF.volumeChangeEventName, onVolumeChange);

    if (options?.video) {
      mediaDeviceDetection
        .getCameraList()
        .then((list) =>
          list?.map((e, i) => {
            if (!e.InputDeviceInfo.label) {
              Reflect.set(
                e,
                "extraLabel",
                `默认摄像头(Built-In) ${i > 0 ? `${i + 1}` : ""}`
              );
            }
            if (!e.deviceId) {
              Reflect.set(
                e,
                "extraDeviceId",
                `default${i > 0 ? `${i + 1}` : ""}`
              );
            }
            return e as ICameraInfo;
          })
        )
        .then((list) => {
          cameraList.value = list || [];
          options?.onCameraListReady?.(list || []);
        });
    }

    if (options?.audio) {
      mediaDeviceDetection
        .getMicrophoneList()
        .then((list) =>
          list?.map((e, i) => {
            if (!e.label) {
              Reflect.set(
                e,
                "extraLabel",
                `外置麦克风(Built-In) ${i > 0 ? `${i + 1}` : ""}`
              );
            }
            if (!e.deviceId) {
              Reflect.set(
                e,
                "extraDeviceId",
                `default${i > 0 ? `${i + 1}` : ""}`
              );
            }
            return e as IMicrophoneInfo;
          })
        )
        .then((list) => {
          microphoneList.value = list || [];
          options?.onMicrophoneListReady?.(list || []);
        });

      mediaDeviceDetection
        .getAudioOutputDeviceList()
        .then((list) =>
          list?.map((e, i) => {
            if (!e.label) {
              Reflect.set(
                e,
                "extraLabel",
                `外置扬声器(Built-In) ${i > 0 ? `${i + 1}` : ""}`
              );
            }
            if (!e.deviceId) {
              Reflect.set(
                e,
                "extraDeviceId",
                `default${i > 0 ? `${i + 1}` : ""}`
              );
            }
            return e as IMicrophoneInfo;
          })
        )
        .then((list) => {
          audioOutputList.value = list || [];
          options?.onAudioOutputListReady?.(list || []);
        });
    }
  }

  init();

  return {
    cameraList,
    microphoneList,
    audioOutputList,
    mediaDeviceDetection,
    release,
    releaseMicrophone,
    releaseStream,
  };
}

import { audioWorkletProcessorURL, processorName } from "./worker";
import CGF from "./config";

export interface ICameraInfo extends MediaTrackCapabilities {
  InputDeviceInfo: MediaDeviceInfo;
  extraDeviceId?: string;
  extraLabel?: string;
}

export interface IMediaDeviceDetectionOptions {
  onGetCameraError: (error: Error) => void;
  onGetMicrophoneError: (error: Error) => void;
  onGetAudioOutputError: (error: Error) => void;
}

export default class MediaDeviceDetection {
  audioContext: useTypes.data.Nullable<AudioContext> = null;
  audioWorkletNode: useTypes.data.Nullable<AudioWorkletNode> = null;
  micStream: useTypes.data.Nullable<MediaStream> = null;
  micStreamSource: useTypes.data.Nullable<MediaStreamAudioSourceNode> = null;

  onGetCameraError: IMediaDeviceDetectionOptions["onGetCameraError"] = (
    error
  ) => {
    console.debug("getCameraDeviceList error", error);
  };

  onGetMicrophoneError: IMediaDeviceDetectionOptions["onGetMicrophoneError"] = (
    error
  ) => {
    console.debug("getMicrophoneDeviceList error", error);
  };

  onGetAudioOutputError: IMediaDeviceDetectionOptions["onGetAudioOutputError"] =
    (error) => {
      console.debug("getAudioOutputDeviceList error", error);
    };

  constructor(options?: Partial<IMediaDeviceDetectionOptions>) {
    if (typeof options?.onGetCameraError === "function") {
      this.onGetCameraError = options.onGetCameraError;
    }
    if (typeof options?.onGetMicrophoneError === "function") {
      this.onGetMicrophoneError = options.onGetMicrophoneError;
    }
    if (typeof options?.onGetAudioOutputError === "function") {
      this.onGetAudioOutputError = options.onGetAudioOutputError;
    }
  }

  /**
   * 监听 摄像头和麦克风 权限变化
   */
  watchPermissions(
    onPermissionChange: (
      type: "camera" | "microphone",
      current: string,
      event: Event
    ) => void
  ) {
    const controller = new AbortController();
    const watch = async () => {
      const micPermission = await navigator.permissions.query({
        name: "microphone",
      });
      const camPermission = await navigator.permissions.query({
        name: "camera",
      });
      const microphonePermissionChange = (event: Event) => {
        const target = event.target as PermissionStatus;
        onPermissionChange("microphone", target.state, event);
      };
      const cameraPermissionChange = (event: Event) => {
        const target = event.target as PermissionStatus;
        onPermissionChange("camera", target.state, event);
      };
      micPermission.addEventListener("change", microphonePermissionChange, {
        signal: controller.signal,
      });
      camPermission.addEventListener("change", cameraPermissionChange, {
        signal: controller.signal,
      });
    };
    watch();
    return controller;
  }

  /**
   * 获取摄像头列表
   */
  async getCameraList() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoinputDevices = devices.filter(
        (device) => device.kind === "videoinput"
      );
      const handleMediaDeviceInfo = async (item: MediaDeviceInfo) => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { deviceId: item.deviceId },
          });
          const vt = stream.getTracks().find((t) => t.kind === "video");
          if (!vt) {
            return null;
          }
          const capabilities: ICameraInfo = Object.assign(
            {},
            { InputDeviceInfo: item },
            vt.getCapabilities()
          );
          stream.getTracks().forEach((t) => t.stop());
          return capabilities;
        } catch (error) {
          this.onGetCameraError(error as Error);
          return null;
        }
      };
      const arr = videoinputDevices.map(handleMediaDeviceInfo);
      const allSettledTask = await Promise.allSettled(arr);
      const task = allSettledTask.filter(
        (p) =>
          p.status === "fulfilled" &&
          (p as PromiseFulfilledResult<ICameraInfo | null>).value
      ) as PromiseFulfilledResult<ICameraInfo>[];
      const cameras = task.map((p) => p.value);
      const camerasDeviceList = cameras.sort(
        (a, b) => (a.width?.max || 0) - (b.width?.max || 0)
      );
      return camerasDeviceList;
    } catch (error) {
      this.onGetCameraError(error as Error);
    }
  }

  /**
   * 获取摄像头支持的分辨率
   */
  getResolution(device: ICameraInfo) {
    return CGF.defaultCameraList.filter(
      (resolution) =>
        resolution.width <= (device.width?.max || 0) &&
        resolution.height <= (device.height?.max || 0)
    );
  }

  /**
   * 获取麦克风列表
   */
  async getMicrophoneList() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.filter((device) => device.kind === "audioinput");
    } catch (error) {
      this.onGetMicrophoneError(error as Error);
    }
  }

  /**
   * 获取扬声器设备列表
   */
  async getAudioOutputDeviceList() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.filter((device) => device.kind === "audiooutput");
    } catch (error) {
      this.onGetAudioOutputError(error as Error);
    }
  }

  /**
   * 测试麦克风。将触发 volume-change 事件，带出音量值 [0-100]
   */
  async testMicrophone(deviceId: string) {
    try {
      if (!this.audioContext) {
        // @ts-ignore
        this.audioContext = new (globalThis.AudioContext ||
          // @ts-ignore
          globalThis.webkitAudioContext)();
        const workletName = `-${deviceId}`;
        await this.audioContext.audioWorklet.addModule(
          audioWorkletProcessorURL(workletName)
        );
        this.audioWorkletNode = new AudioWorkletNode(
          this.audioContext,
          processorName(workletName)
        );

        /**
         * 开始处理音频
         */
        this.audioWorkletNode.port.onmessage = (event) => {
          if (event.data.type === "volumeChange") {
            const volume = event.data.volume;
            /**
             * 处理音量变化事件，触发 volume-change 事件并传递音量值
             */
            globalThis.dispatchEvent(
              new CustomEvent(CGF.volumeChangeEventName, { detail: volume })
            );
          }
        };
        this.audioWorkletNode.connect(this.audioContext.destination);
      } else {
        this.closeCurrentMicrophone();
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { deviceId, echoCancellation: true },
      });
      this.micStream = stream;
      this.micStreamSource = this.audioContext.createMediaStreamSource(
        this.micStream
      );
      /**
       * 将该分析对象与麦克风音频进行连接
       */
      if (this.audioWorkletNode) {
        this.micStreamSource.connect(this.audioWorkletNode);
      }
    } catch (error) {
      this.onGetMicrophoneError(error as Error);
    }
  }

  closeCurrentMicrophone() {
    try {
      if (this.audioWorkletNode) {
        this.micStreamSource?.disconnect(this.audioWorkletNode);
      }
      this.micStream?.getAudioTracks().forEach((t) => {
        t.stop();
      });
    } catch {
      // ensure microphone was disconnected
    }
  }

  /**
   * 解除麦克风的占用
   */
  releaseMicrophone() {
    try {
      this.closeCurrentMicrophone();
      this.audioWorkletNode?.disconnect();
      this.audioContext = null;
    } catch {
      // ensure audioWorkletNode was disconnected
    }
  }
}

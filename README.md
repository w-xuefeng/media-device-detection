# media-device-detection
媒体设备检测

## How to use

- 1.Install via bun

```bash
bun add media-device-detection
```

- 2.Import what you need to your project

  - Using dialog view via calling a function
  ```ts
  import { displayDialogView } from "media-device-detection";

  const detection = async () => {
    const rs = await displayDialogView({
      audio: true,
      video: true,
      testAudioURL: "/test.mp3"
    });
    console.log("🚀 ~ detection ~ rs:", rs);
  };
  ```

  - Using panel view via calling a function
  ```ts
  import { displayPanelView } from "media-device-detection";

  const detection = async () => {
    const rs = displayPanelView({
      audio: true,
      video: true,
      testAudioURL: "/test.mp3",
      onClose(returnValue?: string) {
        const value = {
          returnValue: returnValue,
          currentIds: rs.mediaDeviceDetection.getCurrentDeviceIds(),
          deviceOk: rs.mediaDeviceDetection.deviceOk(),
        };
        console.log("🚀 ~ ON CLOSE ~ value:", value);
      }
    });
    console.log("🚀 ~ detection ~ rs:", rs);
  };
  ```

  - Using custom element
  ```ts
  import { defineElement } from "media-device-detection";
  defineElement();
  ```

  ```html
  <media-device-detection-dialog video="true" audio="true" testAudioURL="/test.mp3"></media-device-detection-dialog>
  <button class="detection-btn">开始检测</button>
  ```
  ```ts
  import { EVENTS } from "media-device-detection";
  const btn = document.querySelector('.detection-btn');
  const container = document.querySelector('media-device-detection-dialog');
  container.addEventListener(EVENTS.CONFIRM, (e) => {
    const value = {
      returnValue: e.detail,
      currentIds: container.mediaDeviceDetection!.getCurrentDeviceIds(),
      deviceOk: container.mediaDeviceDetection!.deviceOk(),
    };
    console.log("🚀 ~ ON CONFIRM ~ value:", value);
  })
  btn.addEventListener('click', () => {
    container.showModal()
  })
  ```

  ```html
  <media-device-detection-panel testAudioURL="/test.mp3"></media-device-detection-panel>
  ```
  ```ts
  import { EVENTS } from "media-device-detection";

  const panel = document.querySelector('media-device-detection-panel');
  panel.addEventListener(EVENTS.CONFIRM, (e) => {
    const value = {
      returnValue: e.detail,
      currentIds: panel.mediaDeviceDetection!.getCurrentDeviceIds(),
      deviceOk: panel.mediaDeviceDetection!.deviceOk(),
    }
    console.log("🚀 ~ ON CONFIRM ~ value:", value)
  })
  ```

  - Do it yourself
    - Type signature
    ```ts
    interface IMicrophoneInfo extends MediaDeviceInfo {
      extraDeviceId?: string;
      extraLabel?: string;
    }

    interface IAudioOutputDeviceInfo extends MediaDeviceInfo {
      extraDeviceId?: string;
      extraLabel?: string;
    }

    interface IMediaDeviceDetectionOptions {
      onGetCameraError: (error: Error) => void;
      onGetMicrophoneError: (error: Error) => void;
      onGetAudioOutputError: (error: Error) => void;
    }

    interface IUseMediaDeviceDetectionOptions {
      video: boolean;
      audio: boolean;
      onVolumeChange?(e: CustomEvent<number>): void;
      onCameraListReady?(e: ICameraInfo[]): void;
      onMicrophoneListReady?(e: IMicrophoneInfo[]): void;
      onAudioOutputListReady?(e: IAudioOutputDeviceInfo[]): void;
      mediaDeviceDetectionOptions?: Partial<IMediaDeviceDetectionOptions>;
    }
    ```
    - Use case
    ```ts
    import { useMediaDeviceDetection } from "media-device-detection";
    const options: IUseMediaDeviceDetectionOptions = {
      video: true,
      audio: true
      // .... other options
    }
    const result = useMediaDeviceDetection(options);
    console.log("🚀 ~ result:", result)  
    ```


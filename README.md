# media-device-detection
媒体设备检测

## How to use

- 1.install via bun

```bash
bun add media-device-detection
```

- 2.import what you need to your project

  - using dialog view via calling a function
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

  - using panel view via calling a function
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

  - using custom element
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

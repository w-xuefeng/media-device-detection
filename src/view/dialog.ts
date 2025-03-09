import { type ICameraInfo } from "../core/media-device-detection";
import {
  useMediaDeviceDetection,
  type IMicrophoneInfo,
  type IAudioOutputDeviceInfo,
  type IUseMediaDeviceDetectionOptions,
} from "../core/use-media-device-detection";
import { addClass, addCSS, h, rerender, setCssVar } from "../utils";
import {
  dialogContainerName,
  dialogStyle,
  globalStore,
  methodsStore,
  onStoreChange,
  panelContainerName,
  panelStyle,
  prefix,
  type TGlobalStore,
} from "./store";

export type TCustomDialogContentCreator = (
  dialogContainer: HTMLDialogElement,
  store: TGlobalStore,
  options: IUseMediaDeviceDetectionOptions
) => (HTMLElement | Node)[];

const onCameraChange = (store: TGlobalStore) => {
  return function (this: HTMLSelectElement) {
    store.currentIds.camera = this.value;
    store.currentCamera = store.cameraList.find(
      (e) => e.deviceId === this.value
    )!;
    updateCurrentCameraMediaStream(store, store.currentCamera);
  };
};

function cameraDetectionView(
  store: TGlobalStore,
  options: IUseMediaDeviceDetectionOptions
) {
  if (!options.video) {
    return null;
  }
  const cameraVideoRef = h("video", {
    className: "camera-video",
    autoplay: true,
    muted: true,
  });
  store.cameraVideoRef = cameraVideoRef;
  updateCurrentCameraMediaStream(
    store,
    store.cameraList.find((e) => e.deviceId === store.currentIds.camera) ||
      store.cameraList[0]
  );

  const createCameraContent = () => {
    return [
      h("h3", { className: "label" }, "摄像头"),
      h(
        "select",
        {
          className: "media-select",
          value: store.currentIds.camera,
          attrs: {
            placeholder: "请选择一个摄像头",
            disabled: String(!store.permission.camera),
          },
          on: {
            change: onCameraChange(store),
          },
        },
        store.cameraList.map((e) =>
          h(
            "option",
            {
              value: e.deviceId,
            },
            e.InputDeviceInfo.label
          )
        )
      ),
      cameraVideoRef,
    ];
  };

  const view = h("div", { className: "camera" }, createCameraContent());

  onStoreChange("cameraList", () => {
    rerender(view, createCameraContent);
  });

  return view;
}

function microphoneDetectionView(
  store: TGlobalStore,
  options: IUseMediaDeviceDetectionOptions
) {
  if (!options.audio) {
    return null;
  }
  const lines = new Array(10).fill(0).map((_, i) =>
    h("div", {
      className: "line-gap",
      style: {
        left: `${i * 10}%`,
      },
    })
  );
  const volumeRef = h("div", {
    className: "microphone-voice",
  });
  store.volumeRef = volumeRef;
  const microphoneDetection = h("div", { className: "microphone-detection" }, [
    ...lines,
    volumeRef,
  ]);
  return h("div", { className: "microphone-sound" }, [microphoneDetection]);
}

function permissionView(
  store: TGlobalStore,
  options: IUseMediaDeviceDetectionOptions
) {
  let videoPermissionTips: HTMLElement | null = null;
  let audioPermissionTips: HTMLElement | null = null;
  let audioOutputPermissionTips: HTMLElement | null = null;
  if (options.video && !store.permission.camera) {
    videoPermissionTips = h(
      "div",
      { className: "no-permission" },
      "未开启摄像头权限，请在开启权限后重试"
    );
  }
  if (options.audio && !store.permission.microphone) {
    audioPermissionTips = h(
      "div",
      {
        className: "no-permission",
      },
      "未开启麦克风权限，请在开启权限后重试"
    );
  }
  if (options.audio && !store.permission.audioOutput) {
    audioOutputPermissionTips = h(
      "div",
      { className: "no-permission" },
      "未开启扬声器权限，请在开启权限后重试"
    );
  }
  const permissionTipsContainer = h(
    "div",
    { className: "permission" },
    [
      videoPermissionTips,
      audioPermissionTips,
      audioOutputPermissionTips,
    ].filter((e) => !!e)
  );

  onStoreChange("permission", (value) => {
    console.log("🚀 ~ onStoreChange permission ~ value:", value);
  });

  return permissionTipsContainer.hasChildNodes()
    ? permissionTipsContainer
    : null;
}

// <div class="content">
//   <div class="camera" v-if="waitDetectionConfig.video">
//     <h3 class="label">摄像头</h3>
//     <el-select
//       v-model="currentIds.camera"
//       class="media-select"
//       placeholder="请选择一个摄像头"
//       size="large"
//       @change="onCameraChange"
//       :disabled="!permissionState.camera"
//     >
//       <el-option
//         v-for="(item, i) in cameraList"
//         :key="`${item.InputDeviceInfo.deviceId}-${i}`"
//         :label="item.InputDeviceInfo.label"
//         :value="item.InputDeviceInfo.deviceId"
//       />
//     </el-select>
//     <video ref="cameraVideoRef" class="camera-video" autoplay muted></video>
//   </div>
//   <div class="mkf-sound" v-if="waitDetectionConfig.audio">
//     <h3 class="label">扬声器</h3>
//     <el-select
//       v-model="currentIds.audioOutput"
//       class="media-select"
//       placeholder="请选择一个扬声器"
//       size="large"
//       @change="onAudioOutputDeviceChange"
//       :disabled="!permissionState.audioOutput || !permissionState.microphone"
//     >
//       <el-option
//         v-for="(item, i) in audioOutputList"
//         :key="`${item.deviceId}-${i}`"
//         :label="item.label || item.extraLabel"
//         :value="item.deviceId"
//       />
//     </el-select>

//     <div
//       class="sound-play"
//       :class="{ disabled: !permissionState.audioOutput || !permissionState.microphone }"
//       @click="togglePlayAudio"
//     >
//       <span>播放声音</span>
//       <audio class="audio-output" ref="audioRef"></audio>
//       <el-icon class="sound-play-right" size="26" color="var(--primary-color)">
//         <VideoPlay v-if="audioPaused" />
//         <VideoPause v-else />
//       </el-icon>
//     </div>

//     <h3 class="label" style="margin-top: 20px">麦克风</h3>
//     <el-select
//       v-model="currentIds.microphone"
//       class="media-select"
//       placeholder="请选择一个麦克风"
//       size="large"
//       @change="onMicrophoneChange"
//       :disabled="!permissionState.microphone"
//     >
//       <el-option
//         v-for="(item, i) in microphoneList"
//         :key="`${item.deviceId}-${i}`"
//         :label="item.label || item.extraLabel"
//         :value="item.deviceId"
//       />
//     </el-select>

//     <div class="mkf-detection">
//       <div
//         class="line-gap"
//         v-for="line in 9"
//         :key="line"
//         :style="{ left: `${line * 10}%` }"
//       ></div>
//       <div ref="volumeRef" class="mkf-voice"></div>
//     </div>
//   </div>
// </div>

function defaultDialogContentCreator(
  dialogContainer: HTMLDialogElement,
  store: TGlobalStore,
  options: IUseMediaDeviceDetectionOptions
) {
  const createMainContent = () => {
    return [
      cameraDetectionView(store, options),
      microphoneDetectionView(store, options),
    ].filter((e) => !!e);
  };

  const main = h(
    "main",
    {
      className: "main",
    },
    createMainContent()
  );

  const cancelBtn = h(
    "button",
    {
      className: "cancel-btn",
      on: {
        click: () => {
          dialogContainer.close();
        },
      },
    },
    "取消"
  );

  const confirmBtn = h(
    "button",
    {
      className: "confirm-btn",
      on: {
        click: () => {
          dialogContainer.close(
            Object.entries(store.currentIds)
              .map(([k, v]) => `${k}:${v}`)
              .join("|")
          );
        },
      },
    },
    "确定"
  );

  const actionBar = h(
    "div",
    {
      className: "acton-bar",
    },
    [cancelBtn, confirmBtn]
  );

  const tips = permissionView(store, options);

  return [tips, main, actionBar].filter((e) => !!e);
}

async function updateCurrentCameraMediaStream(
  store: TGlobalStore,
  camera?: ICameraInfo
) {
  if (!store?.cameraVideoRef || !camera) {
    return;
  }

  if (store.currentCameraStream) {
    store.currentCameraStream.getTracks().forEach((e) => e.stop());
  }

  store.currentCameraStream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
      deviceId: camera.InputDeviceInfo.deviceId,
      width: camera.width,
      height: camera.height,
    },
  });
  store.cameraVideoRef.srcObject = store.currentCameraStream;
  console.log("🚀 ~ store.currentCameraStream:", store.currentCameraStream);
}
function onMicrophoneChange(
  store: TGlobalStore,
  deviceId: string,
  notUpdateCurrent = false
) {
  if (!notUpdateCurrent) {
    store.currentMicrophone =
      store.microphoneList.find((e) => e.deviceId === deviceId) || null;
  }
  console.log("store.mediaDeviceDetection", store.mediaDeviceDetection);
  store.mediaDeviceDetection?.testMicrophone(deviceId);
}

const updateCurrentAudioContext = async (
  store: TGlobalStore,
  deviceId?: string
) => {
  if (!store?.audioRef || !deviceId) {
    return;
  }

  if (store.currentAudioOutputStream) {
    store.currentAudioOutputStream.getTracks().forEach((e) => e.stop());
  }

  if (!store.audioRef.paused) {
    store.audioRef.pause();
  }

  store.currentAudioOutputStream = await navigator.mediaDevices.getUserMedia({
    video: false,
    audio: {
      deviceId,
    },
  });

  store.audioRef.src = store.audioOutputDetectionMusic;
  // const audioContext = new AudioContext();
  // const mediaStreamDestination = audioContext.createMediaStreamDestination();
  // const audioSource = audioContext.createMediaElementSource(audioRef.value);
  // audioSource.connect(mediaStreamDestination);
  // const deviceOutputSource = audioContext.createMediaStreamSource(currentAudioOutputStream.value);
  // deviceOutputSource.connect(mediaStreamDestination);
};

const togglePlayAudio = async (store: TGlobalStore) => {
  if (
    !store?.audioRef ||
    !store.permission.audioOutput ||
    !store.permission.microphone
  ) {
    return;
  }
  if (store.audioRef.paused && store.currentIds.audioOutput) {
    await updateCurrentAudioContext(store, store.currentIds.audioOutput);
    store.audioRef.play();
  } else {
    store.audioRef.pause();
    store.currentAudioOutputStream &&
      methodsStore.releaseStream(store.currentAudioOutputStream);
  }
};

function createDialogContentCreator(
  options: IUseMediaDeviceDetectionOptions,
  store: TGlobalStore,
  customDialogContentCreator?: TCustomDialogContentCreator
) {
  const onVolumeChange = (e: CustomEvent<number>) => {
    options.onVolumeChange?.(e);
    if (!store.volumeRef) {
      return;
    }
    if (!store.microphoneHasVoice && e.detail > 0) {
      store.microphoneHasVoice = true;
    }
    if (![-Infinity].includes(e.detail) && e.detail >= 0) {
      setCssVar(
        "--volume-width",
        `${e.detail < 1 ? 1 + e.detail : e.detail}%`,
        store.volumeRef
      );
    }
  };
  const onGetCameraError = (e: Error) => {
    console.log("onGetCameraError", e?.message);
    store.permission.camera = false;
  };
  const onGetMicrophoneError = (e: Error) => {
    console.log("onGetMicrophoneError", e?.message);
    store.permission.microphone = false;
  };
  const onGetAudioOutputError = (e: Error) => {
    console.log("onGetAudioOutputError", e?.message);
    store.permission.audioOutput = false;
  };
  const onCameraListReady = (data: ICameraInfo[]) => {
    if (!data[0]) {
      store.permission.camera = false;
      return;
    }
    store.permission.camera = true;
    store.currentCamera = data[0];
    store.currentIds.camera = store.currentCamera?.InputDeviceInfo.deviceId;
    store.cameraList = data;
    updateCurrentCameraMediaStream(store, store.currentCamera);
  };
  const onMicrophoneListReady = (e: IMicrophoneInfo[]) => {
    if (!e[0]) {
      store.permission.microphone = false;
      store.microphoneList = [];
      return;
    }
    store.permission.microphone = true;
    store.currentMicrophone = e[0];
    store.currentIds.microphone =
      store.currentMicrophone.extraDeviceId || store.currentMicrophone.deviceId;
    store.microphoneList = e;
    onMicrophoneChange(store, store.currentIds.microphone, true);
  };

  const onAudioOutputListReady = (list: IAudioOutputDeviceInfo[]) => {
    if (!list[0]) {
      store.permission.audioOutput = false;
      return;
    }
    store.permission.audioOutput = true;
    store.currentAudioOutputDevice = list[0];
    store.currentIds.audioOutput =
      store.currentAudioOutputDevice.extraDeviceId ||
      store.currentAudioOutputDevice.deviceId;
    store.audioOutputList = list;
    updateCurrentAudioContext(store, store.currentIds.audioOutput);

    /**
     * bind audio play event
     */
    if (!store.audioRef) {
      return;
    }
    store.audioRef.onplay = () => {
      store.audioPaused = false;
    };
    store.audioRef.onpause = () => {
      store.audioPaused = true;
    };
  };

  return function (dialogContainer: HTMLDialogElement) {
    const {
      mediaDeviceDetection,
      release,
      microphoneList,
      cameraList,
      audioOutputList,
      releaseStream,
    } = useMediaDeviceDetection({
      ...options,
      onVolumeChange,
      onCameraListReady,
      onMicrophoneListReady,
      onAudioOutputListReady,
      mediaDeviceDetectionOptions: {
        onGetCameraError,
        onGetMicrophoneError,
        onGetAudioOutputError,
      },
    });
    methodsStore.release = release;
    methodsStore.releaseStream = releaseStream;
    store.mediaDeviceDetection = mediaDeviceDetection;
    store.microphoneList = microphoneList.value;
    store.cameraList = cameraList.value;
    store.audioOutputList = audioOutputList.value;
    dialogContainer.addEventListener("close", () => {
      release([store.currentCameraStream]);
    });

    if (typeof customDialogContentCreator === "function") {
      return customDialogContentCreator(dialogContainer, store, options);
    }
    return defaultDialogContentCreator(dialogContainer, store, options);
  };
}

function createDialogView(
  contentCreator: (dialogContainer: HTMLDialogElement) => (Node | string)[]
) {
  const dialog = document.createElement("dialog");
  dialog.append.apply(dialog, contentCreator(dialog));
  addClass(dialog, dialogContainerName);
  return dialog;
}

function defineCustomElement(name: string) {
  if (customElements.get(name)) {
    return;
  }
  customElements.define(
    name,
    class extends HTMLDivElement {
      constructor() {
        super();
      }
    },
    {
      extends: "div",
    }
  );
}

function createShadow(
  type: "dialog" | "panel",
  ...nodes: (Node | HTMLElement | string)[]
) {
  const containerName =
    type === "dialog" ? dialogContainerName : panelContainerName;
  defineCustomElement(containerName);
  const root = document.createElement(containerName);
  const shadowRoot = root.attachShadow({ mode: "open" });
  const styleTagId = `${prefix}style`;
  const style = type === "dialog" ? dialogStyle : panelStyle;
  addCSS(style, styleTagId, shadowRoot);
  shadowRoot.append.apply(shadowRoot, nodes);
  return {
    shadowRoot,
    root,
  };
}

export function displayDialogView(
  options: IUseMediaDeviceDetectionOptions = { video: true, audio: true },
  customDialogContentCreator?: TCustomDialogContentCreator
) {
  const contentCreator = createDialogContentCreator(
    options,
    globalStore,
    customDialogContentCreator
  );
  const dialog = createDialogView(contentCreator);
  const shadow = createShadow("dialog", dialog);
  dialog.addEventListener("close", () => {
    console.log(
      "🚀 ~ dialog.onClose ~ dialog.returnValue:",
      dialog.returnValue
    );
    shadow.root.remove();
  });

  const deviceOk = () => {
    let audioOk = true;
    let videoOk = true;
    if (options.video) {
      videoOk =
        globalStore.permission.camera && !!globalStore.currentCameraStream;
    }
    if (options.audio) {
      audioOk =
        globalStore.permission.microphone &&
        !!globalStore.currentMicrophone &&
        globalStore.microphoneHasVoice;
    }
    console.log("AudioOk", audioOk, "VideoOk", videoOk);
    return audioOk && videoOk;
  };
  Reflect.set(dialog, "deviceOk", deviceOk);
  document.body.append(shadow.root);
  dialog.showModal();
  return dialog;
}

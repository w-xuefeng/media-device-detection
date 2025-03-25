import { type ICameraInfo } from "../core/media-device-detection";
import {
  useMediaDeviceDetection,
  type IMicrophoneInfo,
  type IAudioOutputDeviceInfo,
  type IUseMediaDeviceDetectionOptions,
} from "../core/use-media-device-detection";
import {
  addClass,
  addCSS,
  h,
  rerender,
  rerenderChildren,
  setCssVar,
  throttle,
} from "../utils";
import { IconPause, IconPlay } from "../utils/assets";
import AudioVisualization from "../utils/audio-visualization";
import {
  cleanStoreEvent,
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

const onAudioOutputDeviceChange = (store: TGlobalStore) => {
  return function (this: HTMLSelectElement) {
    store.currentAudioOutputDevice = store.audioOutputList.find(
      (e) => e.deviceId === this.value
    )!;
    updateCurrentAudioContext(store, this.value);
  };
};

const onMicrophoneChange = (store: TGlobalStore) => {
  return function (this: HTMLSelectElement) {
    store.currentMicrophone =
      store.microphoneList.find((e) => e.deviceId === this.value) || null;
    store.mediaDeviceDetection?.testMicrophone(this.value);
  };
};

function permissionView(
  store: TGlobalStore,
  options: IUseMediaDeviceDetectionOptions
) {
  const createPermissionContent = () => {
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
    return [
      videoPermissionTips,
      audioPermissionTips,
      audioOutputPermissionTips,
    ].filter((e) => !!e);
  };
  const permissionTipsContainer = h(
    "div",
    { className: "permission" },
    createPermissionContent()
  );
  onStoreChange(
    [
      "permission",
      "permission.camera",
      "permission.microphone",
      "permission.audioOutput",
    ],
    () => {
      rerenderChildren(permissionTipsContainer, createPermissionContent);
    }
  );
  return permissionTipsContainer;
}

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
          placeholder: "请选择一个摄像头",
          disabled: !store.permission.camera,
          on: {
            change: onCameraChange(store),
          },
        },
        store.cameraList.map((e) =>
          h(
            "option",
            {
              value: e.deviceId || e.extraDeviceId,
            },
            e.InputDeviceInfo.label || e.extraLabel
          )
        )
      ),
      cameraVideoRef,
    ];
  };

  const view = h("div", { className: "camera" }, createCameraContent());

  onStoreChange(["cameraList", "permission.camera"], () => {
    rerenderChildren(view, createCameraContent);
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

  const renderIcon = () => {
    return [
      store.audioPaused
        ? h("div", { innerHTML: IconPlay })
        : h("div", { innerHTML: IconPause }),
    ];
  };
  const icon = h("div", { className: "sound-play-right" }, renderIcon());

  onStoreChange("audioPaused", () => {
    rerenderChildren(icon, renderIcon);
  });

  const renderMicrophoneDetection = () => {
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
    return h("div", { className: "microphone-detection" }, [
      ...lines,
      volumeRef,
    ]);
  };

  const renderAudioOutputSelect = () =>
    h(
      "select",
      {
        value: store.currentIds.audioOutput,
        className: "media-select",
        placeholder: "请选择一个扬声器",
        disabled: !store.permission.audioOutput || !store.permission.microphone,
        on: {
          change: onAudioOutputDeviceChange(store),
        },
      },
      store.audioOutputList.map((e) =>
        h(
          "option",
          {
            value: e.deviceId || e.extraDeviceId,
          },
          e.label || e.extraLabel
        )
      )
    );

  const renderAudioOutputVisualizationContainer = () => {
    const container = h("div", {
      className: "audio-output-visualization-container",
    });
    store.audioOutputVisualizationContainer = container;
    return container;
  };
  const renderAudioOutputPlay = () => {
    const audio = h("audio", {
      className: "audio-output",
    });
    store.audioRef = audio;
    return h(
      "div",
      {
        className: [
          "sound-play",
          !store.permission.audioOutput || !store.permission.microphone
            ? "disabled"
            : "",
        ]
          .filter(Boolean)
          .join(" "),
        on: {
          click: togglePlayAudio(store),
        },
      },
      [h("span", null, "播放声音"), audio, icon]
    );
  };
  const renderMicrophoneSelect = () =>
    h(
      "select",
      {
        value: store.currentIds.microphone,
        className: "media-select",
        placeholder: "请选择一个麦克风",
        disabled: !store.permission.microphone,
        on: {
          change: onMicrophoneChange(store),
        },
      },
      store.microphoneList.map((e) =>
        h(
          "option",
          {
            value: e.deviceId || e.extraDeviceId,
          },
          e.label || e.extraLabel
        )
      )
    );

  let audioSelect = renderAudioOutputSelect();
  let audioOutputPlay = renderAudioOutputPlay();
  let audioOutputVisualizationContainer =
    renderAudioOutputVisualizationContainer();
  let microphoneSelect = renderMicrophoneSelect();

  const microphoneSoundContainer = h("div", { className: "microphone-sound" }, [
    h("h3", { className: "label" }, "扬声器"),
    audioSelect,
    audioOutputPlay,
    audioOutputVisualizationContainer,
    h("h3", { className: "label", style: "margin-top: 20px" }, "麦克风"),
    microphoneSelect,
    renderMicrophoneDetection(),
  ]);

  onStoreChange(
    [
      "audioOutputList",
      "microphoneList",
      "permission",
      "permission.microphone",
      "permission.audioOutput",
    ],
    () => {
      const [
        nextAudioSelect,
        nextAudioOutputPlay,
        nextAudioOutputVisualizationContainer,
        nextMicrophoneSelect,
      ] = rerender(microphoneSoundContainer, [
        {
          item: audioSelect,
          render: renderAudioOutputSelect,
        },
        {
          item: audioOutputPlay,
          render: renderAudioOutputPlay,
        },
        {
          item: audioOutputVisualizationContainer,
          render: renderAudioOutputVisualizationContainer,
        },
        {
          item: microphoneSelect,
          render: renderMicrophoneSelect,
        },
      ]);
      audioSelect = nextAudioSelect as HTMLSelectElement;
      audioOutputPlay = nextAudioOutputPlay as HTMLDivElement;
      microphoneSelect = nextMicrophoneSelect as HTMLSelectElement;
      audioOutputVisualizationContainer =
        nextAudioOutputVisualizationContainer as HTMLDivElement;
    }
  );

  onStoreChange(
    ["audioRef"],
    throttle(
      (audio) => {
        AudioVisualization.updateTargetAudio(audio);
      },
      1000,
      { trailing: true }
    )
  );

  return microphoneSoundContainer;
}

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

  const tips = permissionView(store, options);

  const main = h(
    "main",
    {
      className: "main",
    },
    createMainContent()
  );

  const actionBar = h(
    "div",
    {
      className: "acton-bar",
    },
    [
      h(
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
      ),
      h(
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
      ),
    ]
  );

  return [tips, main, actionBar];
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
}

const updateCurrentAudioContext = async (
  store: TGlobalStore,
  deviceId?: string
) => {
  if (!store?.audioRef || !deviceId) {
    return;
  }
  store.currentIds.audioOutput = deviceId;
  if (store.currentAudioOutputStream) {
    store.currentAudioOutputStream.getTracks().forEach((e) => e.stop());
  }
  if (!store.audioRef.paused) {
    store.audioRef.pause();
  }
  if (!store.audioRef.src) {
    store.audioRef.src = store.audioOutputDetectionMusic;
  }
  if (AudioVisualization.isInit) {
    try {
      await AudioVisualization.setSinkId(deviceId);
    } catch {
      await AudioVisualization.setSinkId(deviceId);
    }
  } else {
    const audioVisualization = await AudioVisualization.create(
      deviceId,
      store.audioRef,
      store.audioOutputVisualizationContainer
    );
    audioVisualization.start();
  }
};

const togglePlayAudio = (store: TGlobalStore) => {
  return async function () {
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
    store.mediaDeviceDetection?.testMicrophone(store.currentIds.microphone);
  };

  const bindAudioOutputPlayEvent = (audio: HTMLAudioElement | null) => {
    if (!audio) {
      return;
    }
    audio.onplay = () => {
      store.audioPaused = false;
      console.log("[[play]]");
    };
    audio.onpause = () => {
      store.audioPaused = true;
      console.log("[[paused]]");
    };
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
    bindAudioOutputPlayEvent(store.audioRef);
    onStoreChange(["audioRef"], (audioRef) => {
      bindAudioOutputPlayEvent(audioRef as HTMLAudioElement);
    });
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

    const watcher = mediaDeviceDetection.watchPermissions((type, status) => {
      store.permission[type] = status === "granted";
    });

    methodsStore.release = release;
    methodsStore.releaseStream = releaseStream;
    store.mediaDeviceDetection = mediaDeviceDetection;
    store.microphoneList = microphoneList.value;
    store.cameraList = cameraList.value;
    store.audioOutputList = audioOutputList.value;
    dialogContainer.addEventListener("close", () => {
      watcher.abort();
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
    AudioVisualization.stop();
    shadow.root.remove();
    cleanStoreEvent();
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

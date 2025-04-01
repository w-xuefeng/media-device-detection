import { type ICameraInfo } from "../../core/media-device-detection";
import {
  useMediaDeviceDetection,
  type IMicrophoneInfo,
  type IAudioOutputDeviceInfo,
  type IUseMediaDeviceDetectionOptions,
} from "../../core/use-media-device-detection";
import {
  h,
  rerender,
  rerenderChildren,
  setCssVar,
  throttle,
} from "../../utils";
import { IconPause, IconPlay } from "../../utils/assets";
import AudioVisualization from "../../utils/audio-visualization";
import {
  EVENTS,
  IPK,
  methodsStore,
  onStoreChange,
  type TGlobalStore,
} from "../shared/store";
import type {
  IMediaDeviceDetectionViewOptions,
  TCustomDialogContentCreator,
} from "../shared/types";

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
    }
  };
};

function defaultDialogContentCreator(
  container: HTMLElement,
  store: TGlobalStore,
  options: IMediaDeviceDetectionViewOptions
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
              options.onClose?.();
              if (
                "close" in container &&
                typeof container["close"] === "function"
              ) {
                container.close();
              }
              container.dispatchEvent(new CustomEvent(EVENTS.CANCEL));
              container.dispatchEvent(new CustomEvent(EVENTS.CLOSE));
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
              const returnValue = Object.entries(store.currentIds)
                .filter(([k]) => k !== IPK)
                .map(([k, v]) => `${k}:${v}`)
                .join("|");
              options.onClose?.(returnValue);
              if (
                "close" in container &&
                typeof container["close"] === "function"
              ) {
                container.close(returnValue);
              }
              container.dispatchEvent(
                new CustomEvent(EVENTS.CONFIRM, { detail: returnValue })
              );
              container.dispatchEvent(new CustomEvent(EVENTS.CLOSE));
            },
          },
        },
        "确定"
      ),
    ]
  );

  return [tips, main, actionBar];
}

export class MediaDeviceDetectionContentCreator {
  root: HTMLElement;
  options: IMediaDeviceDetectionViewOptions;
  store: TGlobalStore;
  customDialogContentCreator?: TCustomDialogContentCreator;

  constructor(
    root: HTMLElement,
    options: IMediaDeviceDetectionViewOptions,
    store: TGlobalStore,
    customDialogContentCreator?: TCustomDialogContentCreator
  ) {
    this.root = root;
    this.options = options;
    this.store = store;
    this.customDialogContentCreator = customDialogContentCreator;
    if (this.options?.testAudioURL) {
      store.audioOutputDetectionMusic = this.options.testAudioURL;
    }
  }

  #onVolumeChange = (e: CustomEvent<number>) => {
    this.options.onVolumeChange?.(e);
    this.root.dispatchEvent(
      new CustomEvent(EVENTS.VOLUME_CHANGE, {
        detail: e.detail,
      })
    );
    if (!this.store.volumeRef) {
      return;
    }
    if (!this.store.microphoneHasVoice && e.detail > 0) {
      this.store.microphoneHasVoice = true;
    }
    if (![-Infinity].includes(e.detail) && e.detail >= 0) {
      setCssVar(
        "--volume-width",
        `${e.detail < 1 ? 1 + e.detail : e.detail}%`,
        this.store.volumeRef
      );
    }

    if ([-Infinity].includes(e.detail)) {
      setCssVar("--volume-width", `${Math.random()}%`, this.store.volumeRef);
    }
  };

  #onGetCameraError = (e: Error) => {
    console.log("onGetCameraError", e?.message);
    this.store.permission.camera = false;
    this.root.dispatchEvent(
      new CustomEvent(EVENTS.GET_CAMERA_ERROR, {
        detail: e,
      })
    );
  };

  #onGetMicrophoneError = (e: Error) => {
    console.log("onGetMicrophoneError", e?.message);
    this.store.permission.microphone = false;
    this.root.dispatchEvent(
      new CustomEvent(EVENTS.GET_MICROPHONE_ERROR, {
        detail: e,
      })
    );
  };

  #onGetAudioOutputError = (e: Error) => {
    console.log("onGetAudioOutputError", e?.message);
    this.store.permission.audioOutput = false;
    this.root.dispatchEvent(
      new CustomEvent(EVENTS.GET_AUDIO_OUTPUT_ERROR, {
        detail: e,
      })
    );
  };

  #onCameraListReady = (data: ICameraInfo[]) => {
    if (!data[0]) {
      this.store.permission.camera = false;
      return;
    }
    this.store.permission.camera = true;
    this.store.currentCamera = data[0];
    this.store.currentIds.camera =
      this.store.currentCamera?.InputDeviceInfo.deviceId;
    this.store.cameraList = data;
    updateCurrentCameraMediaStream(this.store, this.store.currentCamera);
    this.root.dispatchEvent(
      new CustomEvent(EVENTS.CAMERA_LIST_READY, {
        detail: data,
      })
    );
  };

  #onMicrophoneListReady = (e: IMicrophoneInfo[]) => {
    if (!e[0]) {
      this.store.permission.microphone = false;
      this.store.microphoneList = [];
      return;
    }
    this.store.permission.microphone = true;
    this.store.currentMicrophone = e[0];
    this.store.currentIds.microphone =
      this.store.currentMicrophone.extraDeviceId ||
      this.store.currentMicrophone.deviceId;
    this.store.microphoneList = e;
    this.root.dispatchEvent(
      new CustomEvent(EVENTS.MICROPHONE_LIST_READY, {
        detail: e,
      })
    );
    setTimeout(() => {
      this.store.mediaDeviceDetection?.testMicrophone(
        this.store.currentIds.microphone
      );
    }, 500);
  };

  #bindAudioOutputPlayEvent = (audio: HTMLAudioElement | null) => {
    if (!audio) {
      return;
    }
    audio.onplay = () => {
      this.store.audioPaused = false;
      console.debug("[[play]]", this.store.audioOutputDetectionMusic);
    };
    audio.onpause = () => {
      this.store.audioPaused = true;
      console.debug("[[paused]]", this.store.audioOutputDetectionMusic);
    };
  };

  #onAudioOutputListReady = (list: IAudioOutputDeviceInfo[]) => {
    if (!list[0]) {
      this.store.permission.audioOutput = false;
      return;
    }
    this.store.permission.audioOutput = true;
    this.store.currentAudioOutputDevice = list[0];
    this.store.currentIds.audioOutput =
      this.store.currentAudioOutputDevice.extraDeviceId ||
      this.store.currentAudioOutputDevice.deviceId;
    this.store.audioOutputList = list;
    updateCurrentAudioContext(this.store, this.store.currentIds.audioOutput);
    /**
     * bind audio play event
     */
    this.#bindAudioOutputPlayEvent(this.store.audioRef);
    onStoreChange(["audioRef"], (audioRef) => {
      this.#bindAudioOutputPlayEvent(audioRef as HTMLAudioElement);
    });
    this.root.dispatchEvent(
      new CustomEvent(EVENTS.AUDIO_OUTPUT_LIST_READY, {
        detail: list,
      })
    );
  };

  public create(container: HTMLElement) {
    const {
      mediaDeviceDetection,
      release,
      microphoneList,
      cameraList,
      audioOutputList,
      releaseStream,
    } = useMediaDeviceDetection({
      ...this.options,
      onVolumeChange: this.#onVolumeChange,
      onCameraListReady: this.#onCameraListReady,
      onMicrophoneListReady: this.#onMicrophoneListReady,
      onAudioOutputListReady: this.#onAudioOutputListReady,
      mediaDeviceDetectionOptions: {
        onGetCameraError: this.#onGetCameraError,
        onGetMicrophoneError: this.#onGetMicrophoneError,
        onGetAudioOutputError: this.#onGetAudioOutputError,
      },
    });

    const watcher = mediaDeviceDetection.watchPermissions((type, status) => {
      this.store.permission[type] = status === "granted";
    });

    methodsStore.release = release;
    methodsStore.releaseStream = releaseStream;
    this.store.mediaDeviceDetection = mediaDeviceDetection;
    this.store.microphoneList = microphoneList.value;
    this.store.cameraList = cameraList.value;
    this.store.audioOutputList = audioOutputList.value;

    const nodes =
      typeof this.customDialogContentCreator === "function"
        ? this.customDialogContentCreator(container, this.store, this.options)
        : defaultDialogContentCreator(container, this.store, this.options);

    const eventDispatcher = new AbortController();
    [EVENTS.CLOSE, EVENTS.CANCEL, EVENTS.CONFIRM].forEach((eventName) => {
      container.addEventListener(
        eventName,
        (e) => {
          this.root.dispatchEvent(
            new CustomEvent(eventName, { detail: (e as CustomEvent)?.detail })
          );
        },
        {
          signal: eventDispatcher.signal,
        }
      );
    });
    container.append.apply(container, nodes);

    const dispose = () => {
      eventDispatcher.abort();
      AudioVisualization.stop();
      watcher.abort();
      release([this.store.currentCameraStream]);
    };

    return dispose;
  }
}

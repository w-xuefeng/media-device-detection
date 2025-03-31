import { match } from "ts-pattern";
import { addClass, addCSS } from "../../utils";
import {
  cleanStoreEvent,
  dialogContainerName,
  dialogStyle,
  globalStore,
  IPK,
  panelContainerName,
  panelStyle,
  prefix,
} from "./store";
import { MediaDeviceDetectionContentCreator } from "./component-content";
import {
  IMediaDeviceDetectionViewOptions,
  TCustomDialogContentCreator,
} from "./types";

type MDDEType = "dialog" | "panel";

class MediaDeviceDetectionBaseElement {
  options: IMediaDeviceDetectionViewOptions;
  customDialogContentCreator?: TCustomDialogContentCreator;
  shadowRoot: ShadowRoot;
  style: string = "";
  styleTagId = `${prefix}style`;
  container: HTMLDivElement | HTMLDialogElement;
  dispose = () => {};

  constructor(baseOptions: {
    shadowRoot: ShadowRoot;
    container: HTMLDivElement | HTMLDialogElement;
    options: IMediaDeviceDetectionViewOptions;
    style?: string;
    customDialogContentCreator?: TCustomDialogContentCreator;
  }) {
    const {
      shadowRoot,
      container,
      options,
      customDialogContentCreator,
      style,
    } = baseOptions;
    this.shadowRoot = shadowRoot;
    this.container = container;
    this.options = options;
    this.style = style || "";
    this.customDialogContentCreator = customDialogContentCreator?.bind(this);
    this.connectView();
  }

  injectStyle(style?: string) {
    addCSS(style || this.style, this.styleTagId, this.shadowRoot);
  }

  connectView() {
    this.injectStyle();
    const creator = new MediaDeviceDetectionContentCreator(
      this.options,
      globalStore,
      this.customDialogContentCreator
    );
    const dispose = creator.create(this.container);
    this.shadowRoot.appendChild(this.container);
    this.dispose = dispose;
  }

  deviceOk() {
    let audioOk = true;
    let videoOk = true;
    if (this.options.video) {
      videoOk =
        globalStore.permission.camera && !!globalStore.currentCameraStream;
    }
    if (this.options.audio) {
      audioOk =
        globalStore.permission.microphone &&
        !!globalStore.currentMicrophone &&
        globalStore.microphoneHasVoice;
    }
    return audioOk && videoOk;
  }

  getCurrentDeviceIds() {
    const rs = { ...globalStore.currentIds };
    Reflect.deleteProperty(rs, IPK);
    return rs;
  }

  disconnected() {
    cleanStoreEvent();
    this.dispose();
  }
}

export class MediaDeviceDetectionDialogElement extends HTMLElement {
  mediaDeviceDetection: MediaDeviceDetectionBaseElement;
  dialog: HTMLDialogElement;
  constructor(
    dialog: HTMLDialogElement,
    options: IMediaDeviceDetectionViewOptions,
    customDialogContentCreator?: TCustomDialogContentCreator
  ) {
    super();
    this.dialog = dialog;
    addClass(this.dialog, dialogContainerName);
    const shadowRoot = this.attachShadow({ mode: "open" });
    this.mediaDeviceDetection = new MediaDeviceDetectionBaseElement({
      shadowRoot,
      container: this.dialog,
      options,
      customDialogContentCreator,
      style: dialogStyle,
    });
    this.dialog.addEventListener("close", (e) => {
      this.remove();
    });
  }

  connectedCallback() {
    this.dialog.showModal();
  }

  disconnectedCallback() {
    this.mediaDeviceDetection.disconnected();
  }
}

export class MediaDeviceDetectionPanelElement extends HTMLElement {
  mediaDeviceDetection: MediaDeviceDetectionBaseElement;
  container: HTMLDivElement;

  constructor(
    options: IMediaDeviceDetectionViewOptions,
    customDialogContentCreator?: TCustomDialogContentCreator
  ) {
    super();
    const shadowRoot = this.attachShadow({ mode: "open" });
    this.container = document.createElement("div");
    addClass(this.container, panelContainerName);
    this.mediaDeviceDetection = new MediaDeviceDetectionBaseElement({
      shadowRoot,
      container: this.container,
      options,
      style: panelStyle,
      customDialogContentCreator,
    });
  }

  disconnectedCallback() {
    this.mediaDeviceDetection.disconnected();
  }
}

function defineCustomElement(
  name: string,
  constructor:
    | typeof MediaDeviceDetectionDialogElement
    | typeof MediaDeviceDetectionPanelElement,
  ext?: string
) {
  if (customElements.get(name)) {
    return;
  }
  customElements.define(
    name,
    constructor,
    ext
      ? {
          extends: ext,
        }
      : void 0
  );
}

export function createMediaDeviceDetectionElement(
  type: MDDEType,
  options: IMediaDeviceDetectionViewOptions,
  customDialogContentCreator?: TCustomDialogContentCreator
) {
  const element = match(type)
    .with("dialog", () => {
      defineCustomElement(
        dialogContainerName,
        MediaDeviceDetectionDialogElement
      );
      return new MediaDeviceDetectionDialogElement(
        document.createElement("dialog"),
        options,
        customDialogContentCreator
      );
    })
    .with("panel", () => {
      defineCustomElement(panelContainerName, MediaDeviceDetectionPanelElement);
      return new MediaDeviceDetectionPanelElement(
        options,
        customDialogContentCreator
      );
    })
    .exhaustive();

  return element;
}

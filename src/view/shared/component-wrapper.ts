import { match } from "ts-pattern";
import { addClass, addCSS, parseAttribute, removeCSS } from "../../utils";
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

const defaultOptions: IMediaDeviceDetectionViewOptions = {
  video: true,
  audio: true,
};

const handleAttributeName = (name: string) =>
  match(name)
    .with("testaudiourl", () => "testAudioURL")
    .otherwise(() => name);

const handleAttributes = (attributes: NamedNodeMap) => {
  return attributes.length
    ? Object.fromEntries(
        Array.from(attributes).map((e) => [
          handleAttributeName(e.name),
          parseAttribute(e.value),
        ])
      )
    : {};
};

class MediaDeviceDetectionBaseElement {
  #options: IMediaDeviceDetectionViewOptions;
  #customDialogContentCreator?: TCustomDialogContentCreator;
  #root: HTMLElement;
  #shadowRoot: ShadowRoot;
  #style: string = "";
  #styleTagId = `${prefix}style`;
  #container: HTMLDivElement | HTMLDialogElement;
  #dispose = () => {};

  constructor(baseOptions: {
    root: HTMLElement;
    shadowRoot: ShadowRoot;
    container: HTMLDivElement | HTMLDialogElement;
    options: IMediaDeviceDetectionViewOptions;
    style?: string;
    customDialogContentCreator?: TCustomDialogContentCreator;
    immediate?: boolean;
  }) {
    const {
      root,
      shadowRoot,
      container,
      options,
      customDialogContentCreator,
      style,
      immediate = false,
    } = baseOptions;
    this.#root = root;
    this.#shadowRoot = shadowRoot;
    this.#container = container;
    this.#options = options;
    this.#style = style || "";
    this.#customDialogContentCreator = customDialogContentCreator?.bind(this);
    this.#shadowRoot.appendChild(this.#container);
    if (immediate) {
      this.connectView();
    }
  }

  #injectStyle(style?: string) {
    addCSS(style || this.#style, this.#styleTagId, this.#shadowRoot);
    return () => removeCSS(this.#styleTagId, this.#shadowRoot);
  }

  connectView() {
    this.disconnected();
    const rmStyle = this.#injectStyle();
    const creator = new MediaDeviceDetectionContentCreator(
      this.#root,
      this.#options,
      globalStore,
      this.#customDialogContentCreator
    );
    const dispose = creator.create(this.#container);
    this.#dispose = () => {
      dispose();
      rmStyle();
      Array.from(this.#container.childNodes).forEach((e) => e.remove());
    };
  }

  deviceOk() {
    let audioOk = true;
    let videoOk = true;
    if (this.#options.video) {
      videoOk =
        globalStore.permission.camera && !!globalStore.currentCameraStream;
    }
    if (this.#options.audio) {
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
    this.#dispose();
  }
}

export class MediaDeviceDetectionDialogElement extends HTMLElement {
  static observedAttributes = ["open"];
  dialog: HTMLDialogElement;
  mediaDeviceDetection: MediaDeviceDetectionBaseElement | null = null;
  #options: IMediaDeviceDetectionViewOptions & { open?: boolean | string };
  #customDialogContentCreator?: TCustomDialogContentCreator;

  constructor(
    dialog?: HTMLDialogElement,
    options?: IMediaDeviceDetectionViewOptions & { open?: boolean | string },
    customDialogContentCreator?: TCustomDialogContentCreator
  ) {
    super();
    this.dialog =
      dialog ||
      this.querySelector("dialog") ||
      document.createElement("dialog");
    this.#options = options || defaultOptions;
    addClass(this.dialog, dialogContainerName);
    this.#customDialogContentCreator = customDialogContentCreator;
  }

  #mergeOptionsFromAttrs() {
    this.#options = Object.assign(
      {},
      this.#options,
      handleAttributes(this.attributes)
    );
  }

  connectedCallback() {
    this.#mergeOptionsFromAttrs();
    this.mediaDeviceDetection = new MediaDeviceDetectionBaseElement({
      root: this,
      shadowRoot: this.attachShadow({ mode: "open" }),
      container: this.dialog,
      options: this.#options,
      customDialogContentCreator: this.#customDialogContentCreator,
      style: dialogStyle,
    });
    const observer = new MutationObserver(() => {
      if (this.dialog.open && this.mediaDeviceDetection) {
        this.mediaDeviceDetection.connectView();
        return;
      }
      if (!this.dialog.open && this.mediaDeviceDetection) {
        this.mediaDeviceDetection.disconnected();
        return;
      }
    });
    observer.observe(this.dialog, { attributes: true });

    if (this.#options.open || this.#options.open === "") {
      this.dialog.showModal();
    }
  }

  showModal() {
    this.dialog.showModal();
  }

  show() {
    this.dialog.show();
  }

  close(value?: string) {
    this.dialog.close(value);
  }

  disconnectedCallback() {
    this.mediaDeviceDetection?.disconnected();
  }

  attributeChangedCallback(name: string, oldValue: any, newValue: any) {
    if (name === "open") {
      if (newValue === "" || Boolean(newValue)) {
        this.showModal();
      } else {
        this.close();
      }
    }
  }
}

export class MediaDeviceDetectionPanelElement extends HTMLElement {
  mediaDeviceDetection: MediaDeviceDetectionBaseElement | null = null;
  #container: HTMLDivElement;
  #options: IMediaDeviceDetectionViewOptions;
  #customDialogContentCreator?: TCustomDialogContentCreator;

  constructor(
    options?: IMediaDeviceDetectionViewOptions,
    customDialogContentCreator?: TCustomDialogContentCreator
  ) {
    super();
    this.#options = options || defaultOptions;
    this.#container = document.createElement("div");
    this.#customDialogContentCreator = customDialogContentCreator;
    addClass(this.#container, panelContainerName);
  }

  mergeOptionsFromAttrs() {
    this.#options = Object.assign(
      {},
      this.#options,
      handleAttributes(this.attributes)
    );
  }

  connectedCallback() {
    this.mergeOptionsFromAttrs();
    this.mediaDeviceDetection = new MediaDeviceDetectionBaseElement({
      root: this,
      shadowRoot: this.attachShadow({ mode: "open" }),
      container: this.#container,
      options: this.#options,
      style: panelStyle,
      immediate: true,
      customDialogContentCreator: this.#customDialogContentCreator,
    });
  }

  disconnectedCallback() {
    this.mediaDeviceDetection?.disconnected();
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
        {
          ...options,
          open: true,
        },
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

export function defineElement() {
  defineCustomElement(dialogContainerName, MediaDeviceDetectionDialogElement);
  defineCustomElement(panelContainerName, MediaDeviceDetectionPanelElement);
}

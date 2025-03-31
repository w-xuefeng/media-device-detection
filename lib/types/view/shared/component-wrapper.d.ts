import { IMediaDeviceDetectionViewOptions, TCustomDialogContentCreator } from "./types";
type MDDEType = "dialog" | "panel";
declare class MediaDeviceDetectionBaseElement {
    options: IMediaDeviceDetectionViewOptions;
    customDialogContentCreator?: TCustomDialogContentCreator;
    shadowRoot: ShadowRoot;
    style: string;
    styleTagId: string;
    container: HTMLDivElement | HTMLDialogElement;
    dispose: () => void;
    constructor(baseOptions: {
        shadowRoot: ShadowRoot;
        container: HTMLDivElement | HTMLDialogElement;
        options: IMediaDeviceDetectionViewOptions;
        style?: string;
        customDialogContentCreator?: TCustomDialogContentCreator;
    });
    injectStyle(style?: string): void;
    connectView(): void;
    deviceOk(): boolean;
    getCurrentDeviceIds(): {
        camera: string;
        microphone: string;
        audioOutput: string;
    };
    disconnected(): void;
}
export declare class MediaDeviceDetectionDialogElement extends HTMLElement {
    mediaDeviceDetection: MediaDeviceDetectionBaseElement;
    dialog: HTMLDialogElement;
    constructor(dialog: HTMLDialogElement, options: IMediaDeviceDetectionViewOptions, customDialogContentCreator?: TCustomDialogContentCreator);
    connectedCallback(): void;
    disconnectedCallback(): void;
}
export declare class MediaDeviceDetectionPanelElement extends HTMLElement {
    mediaDeviceDetection: MediaDeviceDetectionBaseElement;
    container: HTMLDivElement;
    constructor(options: IMediaDeviceDetectionViewOptions, customDialogContentCreator?: TCustomDialogContentCreator);
    disconnectedCallback(): void;
}
export declare function createMediaDeviceDetectionElement(type: MDDEType, options: IMediaDeviceDetectionViewOptions, customDialogContentCreator?: TCustomDialogContentCreator): MediaDeviceDetectionDialogElement | MediaDeviceDetectionPanelElement;
export {};

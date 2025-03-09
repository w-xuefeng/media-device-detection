import { type IUseMediaDeviceDetectionOptions } from "../core/use-media-device-detection";
import { type TGlobalStore } from "./store";
export type TCustomDialogContentCreator = (dialogContainer: HTMLDialogElement, store: TGlobalStore, options: IUseMediaDeviceDetectionOptions) => (HTMLElement | Node)[];
export declare function displayDialogView(options?: IUseMediaDeviceDetectionOptions, customDialogContentCreator?: TCustomDialogContentCreator): HTMLDialogElement;

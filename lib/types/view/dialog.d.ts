import { type IUseMediaDeviceDetectionOptions } from "../core/use-media-device-detection";
import { type TGlobalStore } from "./store";
export interface IMediaDeviceDetectionViewOptions extends IUseMediaDeviceDetectionOptions {
    testAudioURL?: string;
}
export interface IMediaDeviceDetectionViewResolveValue {
    returnValue: string;
    currentIds: {
        camera: string;
        microphone: string;
        audioOutput: string;
    };
    deviceOk: boolean;
}
export interface IMediaDeviceDetectionViewReturnValue extends Promise<IMediaDeviceDetectionViewResolveValue> {
    deviceOk: () => boolean;
    getCurrentIds: () => {
        camera: string;
        microphone: string;
        audioOutput: string;
    };
    dialog: HTMLDialogElement;
}
export type TCustomDialogContentCreator = (dialogContainer: HTMLDialogElement, store: TGlobalStore, options: IMediaDeviceDetectionViewOptions) => (HTMLElement | Node)[];
export declare function displayDialogView(options?: IMediaDeviceDetectionViewOptions, customDialogContentCreator?: TCustomDialogContentCreator): IMediaDeviceDetectionViewReturnValue;

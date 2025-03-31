import { type TGlobalStore } from "../shared/store";
import type { IMediaDeviceDetectionViewOptions, TCustomDialogContentCreator } from "../shared/types";
export declare class MediaDeviceDetectionContentCreator {
    #private;
    options: IMediaDeviceDetectionViewOptions;
    store: TGlobalStore;
    customDialogContentCreator?: TCustomDialogContentCreator;
    constructor(options: IMediaDeviceDetectionViewOptions, store: TGlobalStore, customDialogContentCreator?: TCustomDialogContentCreator);
    create(container: HTMLElement): () => void;
}

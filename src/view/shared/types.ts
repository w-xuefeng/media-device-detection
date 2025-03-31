import type { IUseMediaDeviceDetectionOptions } from "../../core/use-media-device-detection";
import type { TGlobalStore } from "./store";

export interface IMediaDeviceDetectionViewOptions
  extends IUseMediaDeviceDetectionOptions {
  testAudioURL?: string;
  onClose?(returnValue?: string): void;
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

export interface IMediaDeviceDetectionViewReturnValue
  extends Promise<IMediaDeviceDetectionViewResolveValue> {
  deviceOk: () => boolean;
  getCurrentIds: () => {
    camera: string;
    microphone: string;
    audioOutput: string;
  };
  container: HTMLElement;
}

export type TCustomDialogContentCreator = (
  container: HTMLElement,
  store: TGlobalStore,
  options: IMediaDeviceDetectionViewOptions
) => (HTMLElement | Node)[];

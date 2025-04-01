import {
  createMediaDeviceDetectionElement,
  MediaDeviceDetectionDialogElement,
} from "../shared/component-wrapper";
import {
  IMediaDeviceDetectionViewOptions,
  IMediaDeviceDetectionViewResolveValue,
  IMediaDeviceDetectionViewReturnValue,
  TCustomDialogContentCreator,
} from "../shared/types";

export function displayDialogView(
  options: IMediaDeviceDetectionViewOptions = {
    video: true,
    audio: true,
  },
  customDialogContentCreator?: TCustomDialogContentCreator
) {
  const { promise, resolve } =
    Promise.withResolvers<IMediaDeviceDetectionViewResolveValue>();

  const el = createMediaDeviceDetectionElement(
    "dialog",
    options,
    customDialogContentCreator
  ) as MediaDeviceDetectionDialogElement;

  el.dialog.addEventListener("close", () => {
    const value = {
      returnValue: el.dialog.returnValue,
      currentIds: el.mediaDeviceDetection!.getCurrentDeviceIds(),
      deviceOk: el.mediaDeviceDetection!.deviceOk(),
    };
    el.remove();
    resolve(value);
  });
  document.body.append(el);
  return promise as IMediaDeviceDetectionViewReturnValue;
}

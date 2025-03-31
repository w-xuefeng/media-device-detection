import {
  createMediaDeviceDetectionElement,
  MediaDeviceDetectionPanelElement,
} from "../shared/component-wrapper";
import {
  IMediaDeviceDetectionViewOptions,
  TCustomDialogContentCreator,
} from "../shared/types";

export function displayPanelView(
  options: IMediaDeviceDetectionViewOptions = {
    video: true,
    audio: true,
  },
  customDialogContentCreator?: TCustomDialogContentCreator
) {
  const el = createMediaDeviceDetectionElement(
    "panel",
    options,
    customDialogContentCreator
  ) as MediaDeviceDetectionPanelElement;
  document.body.append(el);
  return el;
}

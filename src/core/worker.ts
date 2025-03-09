import { getWorkerJsURL } from "../utils";

export const audioWorkletProcessorContent = `registerProcessor('volume-detection-processor',class VolumeDetectionProcessor extends AudioWorkletProcessor{constructor(){super()}process(inputs){const input=inputs[0][0];const buffer=new Float32Array(input);const maxVal=Math.max(...buffer);this.port.postMessage({type:'volumeChange',volume:maxVal*100});return true}});`;

export const audioWorkletProcessorURL = getWorkerJsURL(
  audioWorkletProcessorContent
);

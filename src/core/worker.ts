import { getWorkerJsURL } from "../utils";

export const processorName = (name = "") => `volume-detection-processor${name}`;

export const audioWorkletProcessorContent = (name?: string) =>
  `registerProcessor('${processorName(
    name
  )}',class VolumeDetectionProcessor extends AudioWorkletProcessor{constructor(){super()}process(inputs){const input=inputs[0][0];let buffer=new Float32Array(input);const maxVal=Math.max(...buffer);buffer = null;this.port.postMessage({type:'volumeChange',volume:maxVal*100});return true}});`;

export const audioWorkletProcessorURL = (name?: string) =>
  getWorkerJsURL(audioWorkletProcessorContent(name));

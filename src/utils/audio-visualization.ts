export default class AudioVisualization {
  static sourceNode: MediaElementAudioSourceNode | null = null;
  static audioContext: AudioContext | null = null;
  static buffer: Uint8Array<ArrayBuffer> | null = null;
  static analyser: AnalyserNode | null = null;
  static container: HTMLElement;
  static targetAudio: HTMLAudioElement;
  static canvas: HTMLCanvasElement;
  static ctx: CanvasRenderingContext2D | null;
  static isInit = false;

  static async create(
    deviceId: string,
    targetAudio: HTMLAudioElement,
    targetContainer: string | HTMLElement | null
  ) {
    this.container =
      (typeof targetContainer === "string"
        ? document.querySelector<HTMLElement>(targetContainer)
        : targetContainer) ||
      targetAudio.parentElement ||
      document.body;
    this.targetAudio = targetAudio;
    this.canvas = this.#initCanvas();
    this.ctx = this.canvas.getContext("2d");
    this.targetAudio.addEventListener("play", () => {
      this.#initAudio();
    });
    await this.setSinkId(deviceId);
    return this;
  }

  static #initCanvas() {
    const canvas = document.createElement("canvas");
    canvas.id = "audio-visualization";
    canvas.width = this.container.offsetWidth * devicePixelRatio;
    canvas.height = ((this.container.offsetHeight * 2) / 3) * devicePixelRatio;
    this.container.querySelector(`#${canvas.id}`)?.remove();
    this.container.appendChild(canvas);
    return canvas;
  }

  static setSinkId(deviceId: string) {
    if (this.audioContext && "setSinkId" in AudioContext.prototype) {
      return new Promise((resolve, reject) => {
        this.audioContext
          // @ts-ignore
          ?.setSinkId(deviceId)
          .then(() => {
            resolve(deviceId);
          })
          .catch((error: any) => {
            console.debug(
              "AudioVisualization ~ audioContext.setSinkId ~ error:",
              error
            );
            reject(error);
          });
      });
    }
    return Promise.resolve(
      "the 'setSinkId' is unsupported in the AudioContext prototype"
    );
  }

  static #render() {
    requestAnimationFrame(() => {
      this.#render();
    });
    if (!this.analyser || !this.buffer || !this.ctx) {
      return;
    }
    const { width, height } = this.canvas;
    this.ctx.clearRect(0, 0, width, height);
    this.analyser.getByteFrequencyData(this.buffer);
    const len = this.buffer.length / 5;
    const count = len * 2;
    const barWith = width / count;
    this.ctx.fillStyle = "#46b9ff";
    for (let i = 0; i < len; i++) {
      const v = this.buffer[i];
      const barHeight = (v / 255) * height;
      const x1 = i * barWith + width / 2;
      const x2 = width / 2 - (i + 1) * barWith;
      const y = height - barHeight;
      this.ctx.fillRect(x1, y, barWith - 2, barHeight);
      this.ctx.fillRect(x2, y, barWith - 2, barHeight);
    }
  }

  static #initAudio() {
    if (this.isInit) {
      return;
    }
    this.audioContext = new AudioContext();
    this.sourceNode = this.audioContext.createMediaElementSource(
      this.targetAudio
    );
    this.analyser = this.audioContext.createAnalyser();
    this.sourceNode.connect(this.analyser);
    this.analyser.fftSize = 512;
    this.analyser.connect(this.audioContext.destination);
    this.buffer = new Uint8Array(this.analyser.frequencyBinCount);
    this.isInit = true;
  }

  static updateTargetAudio(audio: HTMLAudioElement) {
    this.stop();
    this.targetAudio = audio;
    this.targetAudio.addEventListener("play", () => {
      this.#initAudio();
    });
    this.start();
  }

  static start() {
    this.#render();
  }

  static stop() {
    this.audioContext?.close();
    this.sourceNode?.disconnect();
    this.buffer = null;
    this.analyser = null;
    this.audioContext = null;
    this.sourceNode = null;
    this.isInit = false;
  }
}

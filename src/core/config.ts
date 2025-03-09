const CGF = {
  volumeChangeEventName: `media-device-detection-volume-change-${Date.now()}`,
  defaultCameraList: [
    {
      label: "4K(UHD)",
      width: 3840,
      height: 2160,
      ratio: "16:9",
    },
    {
      label: "4K(UHD)",
      width: 2160,
      height: 3840,
      ratio: "9:16",
    },
    {
      label: "2K",
      width: 2560,
      height: 1440,
      ratio: "16:9",
    },
    {
      label: "2K",
      width: 1440,
      height: 2560,
      ratio: "9:16",
    },
    {
      label: "1080p(FHD)",
      width: 1920,
      height: 1080,
      ratio: "16:9",
    },
    {
      label: "1080p(FHD)",
      width: 1080,
      height: 1920,
      ratio: "9:16",
    },
    {
      label: "UXGA",
      width: 1600,
      height: 1200,
      ratio: "4:3",
    },
    {
      label: "UXGA",
      width: 1200,
      height: 1600,
      ratio: "3:4",
    },
    {
      label: "720p(HD)",
      width: 1280,
      height: 720,
      ratio: "16:9",
    },
    {
      label: "720p(HD)",
      width: 720,
      height: 1280,
      ratio: "9:16",
    },
    {
      label: "SVGA",
      width: 800,
      height: 600,
      ratio: "4:3",
    },
    {
      label: "SVGA",
      width: 600,
      height: 800,
      ratio: "3:4",
    },
    {
      label: "VGA",
      width: 640,
      height: 480,
      ratio: "4:3",
    },
    {
      label: "360p(nHD)",
      width: 640,
      height: 360,
      ratio: "16:9",
    },
    {
      label: "CIF",
      width: 352,
      height: 288,
      ratio: "4:3",
    },
    {
      label: "QVGA",
      width: 320,
      height: 240,
      ratio: "4:3",
    },
    {
      label: "QCIF",
      width: 176,
      height: 144,
      ratio: "4:3",
    },
    {
      label: "QQVGA",
      width: 160,
      height: 120,
      ratio: "4:3",
    },
  ],
};

export default CGF;

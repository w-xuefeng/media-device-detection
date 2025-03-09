export default {
  "dialog": ".media-device-detection-dialog {\n  --action-bar-height: 38px;\n  --width: clamp(500px, 80vw, 1000px);\n  --height: clamp(300px, 50vh, 500px);\n\n  display: flex;\n  flex-direction: column;\n  width: var(--width);\n  height: var(--height);\n  border-color: transparent;\n\n  .acton-bar {\n    height: var(--action-bar-height);\n    display: flex;\n    align-items: center;\n    justify-content: flex-end;\n    gap: 12px;\n\n    .cancel-btn {\n      box-sizing: border-box;\n      padding: 5px 20px;\n      font-size: 14px;\n      color: #1e90ff;\n      border-radius: 2px;\n      cursor: pointer;\n      outline: none;\n      border: 1px solid #1e90ff;\n      background-color: #fff;\n    }\n\n    .confirm-btn {\n      box-sizing: border-box;\n      padding: 5px 20px;\n      font-size: 14px;\n      color: #fff;\n      border-radius: 2px;\n      cursor: pointer;\n      outline: none;\n      border: none;\n      background: #1e90ff;\n    }\n  }\n\n  .permission {\n    display: flex;\n    flex-direction: column;\n    .no-permission {\n      margin-top: 4px;\n    }\n  }\n\n  .main {\n    display: flex;\n    justify-content: center;\n    gap: 10%;\n    flex-grow: 1;\n\n    .camera {\n      flex: 1;\n    }\n\n    .label {\n      margin: 0 0 10px 0;\n      color: #999;\n      font-weight: 400;\n    }\n\n    .media-select {\n      width: 100%;\n    }\n    .camera-video {\n      border: 1px solid #eaeaea;\n      margin-top: 20px;\n      width: 100%;\n      border-radius: 4px;\n      min-height: 270px;\n      background-color: #eaeaea;\n    }\n\n    .microphone-sound {\n      flex: 1;\n\n      .microphone-detection {\n        width: 100%;\n        height: 10px;\n        margin-top: 10px;\n        border-radius: 2px;\n        overflow: hidden;\n        background-color: #eaeaea;\n        position: relative;\n\n        .line-gap {\n          height: 100%;\n          width: 2px;\n          background-color: #ffffff;\n          position: absolute;\n          top: 0;\n        }\n\n        .microphone-voice {\n          --volume-width: 0;\n          width: var(--volume-width);\n          height: 100%;\n          background-color: #2980fb;\n        }\n      }\n    }\n  }\n}\n",
  "panel": ".media-device-detection-panel {\n  --action-bar-height: 60px;\n  --width: clamp(500px, 80vw, 1000px);\n  --height: clamp(300px, 50vh, 500px);\n\n  display: flex;\n  flex-direction: column;\n  width: var(--width);\n  height: var(--height);\n  border-color: transparent;\n}\n"
}
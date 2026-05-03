import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

function patchFile(relativePath, replacements) {
  const filePath = resolve(process.cwd(), relativePath);
  let contents = readFileSync(filePath, "utf8");
  let changed = false;

  for (const [before, after] of replacements) {
    if (contents.includes(after)) {
      continue;
    }

    if (!contents.includes(before)) {
      throw new Error(`Patch target not found in ${relativePath}`);
    }

    contents = contents.replace(before, after);
    changed = true;
  }

  if (changed) {
    writeFileSync(filePath, contents, "utf8");
    console.log(`Patched ${relativePath}`);
  }
}

const transceiverBefore = `  getAudioTransceiver() {
    // Transceivers always appear in creation-order for both peers
    // Look at addInitialTransceivers
    return this.pc.getTransceivers()[AUDIO_TRANSCEIVER_INDEX];
  }
  getVideoTransceiver() {
    // Transceivers always appear in creation-order for both peers
    // Look at addInitialTransceivers
    return this.pc.getTransceivers()[VIDEO_TRANSCEIVER_INDEX];
  }
  getScreenVideoTransceiver() {
    // Transceivers always appear in creation-order for both peers
    // Look at addInitialTransceivers
    return this.pc.getTransceivers()[SCREEN_VIDEO_TRANSCEIVER_INDEX];
  }`;

const transceiverAfter = `  _getTransceiver(index) {
    const transceivers = this.pc?.getTransceivers?.();
    return transceivers?.[index] ?? null;
  }
  getAudioTransceiver() {
    // Transceivers always appear in creation-order for both peers
    // Look at addInitialTransceivers
    return this._getTransceiver(AUDIO_TRANSCEIVER_INDEX);
  }
  getVideoTransceiver() {
    // Transceivers always appear in creation-order for both peers
    // Look at addInitialTransceivers
    return this._getTransceiver(VIDEO_TRANSCEIVER_INDEX);
  }
  getScreenVideoTransceiver() {
    // Transceivers always appear in creation-order for both peers
    // Look at addInitialTransceivers
    return this._getTransceiver(SCREEN_VIDEO_TRANSCEIVER_INDEX);
  }`;

const eventEmitterModuleBefore = `const nativeEmitter = new NativeEventEmitter(WebRTCModule);`;
const eventEmitterModuleAfter = `const nativeEventModule = WebRTCModule && typeof WebRTCModule.addListener === 'function' && typeof WebRTCModule.removeListeners === 'function' ? WebRTCModule : {
  addListener() {},
  removeListeners() {}
};
const nativeEmitter = new NativeEventEmitter(nativeEventModule);`;

const eventEmitterCommonjsAfter = `const nativeEventModule = WebRTCModule && typeof WebRTCModule.addListener === 'function' && typeof WebRTCModule.removeListeners === 'function' ? WebRTCModule : {
  addListener() {},
  removeListeners() {}
};
const nativeEmitter = new _reactNative.NativeEventEmitter(nativeEventModule);`;

const mediaDevicesBefore = `  _registerEvents() {
    console.log('MediaDevices _registerEvents invoked');
    WebRTCModule.startMediaDevicesEventMonitor();
    addListener(this, 'mediaDevicesOnDeviceChange', () => {
      console.log('MediaDevices => mediaDevicesOnDeviceChange');
      // @ts-ignore
      this.dispatchEvent(new Event('devicechange'));
    });
  }`;

const mediaDevicesAfter = `  _registerEvents() {
    WebRTCModule.startMediaDevicesEventMonitor();
    addListener(this, 'mediaDevicesOnDeviceChange', () => {
      // @ts-ignore
      this.dispatchEvent(new Event('devicechange'));
    });
  }`;

const mediaDevicesCommonjsAfter = `  _registerEvents() {
    WebRTCModule.startMediaDevicesEventMonitor();
    (0, _EventEmitter.addListener)(this, 'mediaDevicesOnDeviceChange', () => {
      // @ts-ignore
      this.dispatchEvent(new _eventTargetShim.Event('devicechange'));
    });
  }`;

patchFile("node_modules/@pipecat-ai/react-native-small-webrtc-transport/lib/module/transport.js", [
  [transceiverBefore, transceiverAfter],
]);

patchFile("node_modules/@pipecat-ai/react-native-small-webrtc-transport/lib/commonjs/transport.js", [
  [transceiverBefore, transceiverAfter],
]);

patchFile("node_modules/@daily-co/react-native-webrtc/lib/module/EventEmitter.js", [
  [eventEmitterModuleBefore, eventEmitterModuleAfter],
]);

patchFile("node_modules/@daily-co/react-native-webrtc/lib/commonjs/EventEmitter.js", [
  ["const nativeEmitter = new _reactNative.NativeEventEmitter(WebRTCModule);", eventEmitterCommonjsAfter],
]);

patchFile("node_modules/@daily-co/react-native-webrtc/lib/module/MediaDevices.js", [
  [mediaDevicesBefore, mediaDevicesAfter],
]);

patchFile("node_modules/@daily-co/react-native-webrtc/lib/commonjs/MediaDevices.js", [
  [`  _registerEvents() {
    console.log('MediaDevices _registerEvents invoked');
    WebRTCModule.startMediaDevicesEventMonitor();
    (0, _EventEmitter.addListener)(this, 'mediaDevicesOnDeviceChange', () => {
      console.log('MediaDevices => mediaDevicesOnDeviceChange');
      // @ts-ignore
      this.dispatchEvent(new _eventTargetShim.Event('devicechange'));
    });
  }`, mediaDevicesCommonjsAfter],
]);

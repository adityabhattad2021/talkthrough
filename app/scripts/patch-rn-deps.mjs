import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Why this script exists
 * ----------------------
 *
 * We depend on a few upstream React Native packages that currently have small
 * compatibility issues in our setup:
 *
 * 1. `@pipecat-ai/react-native-small-webrtc-transport`
 *    can call `this.pc.getTransceivers()` while `this.pc` is still null.
 *    That produces the runtime error:
 *    "Cannot read property 'getTransceivers' of null"
 *
 * 2. `@daily-co/react-native-webrtc`
 *    emits noisy `NativeEventEmitter` warnings on newer React Native versions
 *    because its native module does not expose `addListener` and
 *    `removeListeners` in the shape React Native expects.
 *
 * 3. The same Daily package logs extra MediaDevices debug messages that make
 *    development logs harder to read.
 *
 * We patch those installed files after every `npm install` so the fix is:
 * - reproducible
 * - visible in one place
 * - not lost the next time `node_modules` is recreated
 *
 * This is intentionally a small compatibility layer, not product logic.
 * Once upstream packages fix these issues, this script should be removed.
 */
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

// 1. Make Pipecat's RN SmallWebRTC transport null-safe when reading transceivers.
patchFile("node_modules/@pipecat-ai/react-native-small-webrtc-transport/lib/module/transport.js", [
  [transceiverBefore, transceiverAfter],
]);

patchFile("node_modules/@pipecat-ai/react-native-small-webrtc-transport/lib/commonjs/transport.js", [
  [transceiverBefore, transceiverAfter],
]);

// 2. Silence RN NativeEventEmitter warnings from the Daily WebRTC shim.
patchFile("node_modules/@daily-co/react-native-webrtc/lib/module/EventEmitter.js", [
  [eventEmitterModuleBefore, eventEmitterModuleAfter],
]);

patchFile("node_modules/@daily-co/react-native-webrtc/lib/commonjs/EventEmitter.js", [
  ["const nativeEmitter = new _reactNative.NativeEventEmitter(WebRTCModule);", eventEmitterCommonjsAfter],
]);

// 3. Remove noisy MediaDevices debug logs from Daily WebRTC.
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

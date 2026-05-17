import { PipecatClient, type PipecatClientOptions } from "@pipecat-ai/client-js";
import Daily from "@daily-co/react-native-daily-js";
import { DailyMediaManager } from "@pipecat-ai/react-native-daily-media-manager";
import {
  RNSmallWebRTCTransport,
  type SmallWebRTCTransportConstructorOptions,
} from "@pipecat-ai/react-native-small-webrtc-transport";

const SPEAKERPHONE_DEVICE_ID = "SPEAKERPHONE";

export function createPipecatClient(
  callbacks: PipecatClientOptions["callbacks"],
): PipecatClient {
  // Force voice playback to the device speaker instead of the quieter
  // earpiece/call route.
  const daily = Daily.getCallInstance() ?? Daily.createCallObject();
  void daily.setAudioDevice(SPEAKERPHONE_DEVICE_ID);

  const transportOptions: SmallWebRTCTransportConstructorOptions = {
    mediaManager: new DailyMediaManager(),
  };
  const transport =
    new RNSmallWebRTCTransport(transportOptions) as unknown as PipecatClientOptions["transport"];

  return new PipecatClient({
    transport,
    enableMic: true,
    enableCam: false,
    callbacks,
  });
}

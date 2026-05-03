import { PipecatClient, type PipecatClientOptions } from "@pipecat-ai/client-js";
import { DailyMediaManager } from "@pipecat-ai/react-native-daily-media-manager";
import {
  RNSmallWebRTCTransport,
  type SmallWebRTCTransportConstructorOptions,
} from "@pipecat-ai/react-native-small-webrtc-transport";

export function createPipecatClient(
  callbacks: PipecatClientOptions["callbacks"],
): PipecatClient {
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

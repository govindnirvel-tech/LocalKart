import { ICallEngine } from '../types';

/**
 * Standard CallEngine implementation adhering to ICallEngine interface.
 * Real RTC media provider (e.g. Agora / LiveKit) can be injected here.
 * RTC tokens are fetched strictly from Supabase Edge Functions.
 */
export class CallEngine implements ICallEngine {
  private channelName: string | null = null;
  private uid: string | null = null;
  private isMicMuted: boolean = false;
  private isCameraDisabled: boolean = false;
  private isFrontCam: boolean = true;
  private isSpeakerphoneOn: boolean = false;

  async initialize(channelName: string, uid: string, rtcToken?: string): Promise<void> {
    this.channelName = channelName;
    this.uid = uid;
    if (__DEV__) {
      console.log(`[CallEngine] Initialized channel: ${channelName}, uid: ${uid}, tokenPresent: ${Boolean(rtcToken)}`);
    }
  }

  async joinRoom(): Promise<void> {
    if (__DEV__) {
      console.log(`[CallEngine] Joined RTC channel: ${this.channelName}`);
    }
  }

  async leaveRoom(): Promise<void> {
    if (__DEV__) {
      console.log(`[CallEngine] Left RTC channel: ${this.channelName}`);
    }
  }

  async toggleMicrophone(enabled: boolean): Promise<void> {
    this.isMicMuted = !enabled;
    if (__DEV__) {
      console.log(`[CallEngine] Mic enabled: ${enabled}`);
    }
  }

  async toggleCamera(enabled: boolean): Promise<void> {
    this.isCameraDisabled = !enabled;
    if (__DEV__) {
      console.log(`[CallEngine] Camera enabled: ${enabled}`);
    }
  }

  async switchCamera(): Promise<void> {
    this.isFrontCam = !this.isFrontCam;
    if (__DEV__) {
      console.log(`[CallEngine] Camera switched. Front camera: ${this.isFrontCam}`);
    }
  }

  async toggleSpeakerphone(enabled: boolean): Promise<void> {
    this.isSpeakerphoneOn = enabled;
    if (__DEV__) {
      console.log(`[CallEngine] Speakerphone enabled: ${enabled}`);
    }
  }

  destroy(): void {
    this.channelName = null;
    this.uid = null;
    if (__DEV__) {
      console.log('[CallEngine] Engine destroyed');
    }
  }
}

export const defaultCallEngine = new CallEngine();

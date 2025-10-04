/// <reference types="vite/client" />

declare const __POKI__: boolean;
declare const __DEV__: boolean;

type PokiSDKStringURL = string;

declare class PokiSDK {
  static setDebug: (enable: boolean) => void;
  static init: () => Promise<void>;
  static gameLoadingFinished: () => void;
  static gameplayStart: () => void;
  static gameplayStop: () => void;
  static commercialBreak: (cbWhenStarted?: () => unknown) => Promise<void>;
  static rewardedBreak: (cbWhenStarted?: () => unknown) => Promise<boolean>;
  static getLanguage: () => string;
  static generateScreenshot: () => Promise<PokiSDKStringURL>;
  static enableEventTracking: (enable: boolean) => void;
  static shareableURL: (params: Record<string, unknown>) => Promise<PokiSDKStringURL>;
  static getURLParam: (paramName: string) => string;
  static playtestSetCanvas: (canvas: HTMLCanvasElement) => void;
}

declare global {
  interface Window {
    PokiSDK: PokiSDK;
  }
}
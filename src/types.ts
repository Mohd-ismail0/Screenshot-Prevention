export interface ScreenshotPreventionOptions {
    blurIntensity?: string;
    warningMessage?: string;
    preventCopy?: boolean;
    preventInspect?: boolean;
    recoveryDelay?: number;
    debug?: boolean;
    onAttempt?: (details: AttemptDetails) => void;
  }
  
  export interface AttemptDetails {
    count: number;
    method: DetectionMethod;
    timestamp: number;
  }
  
  export type DetectionMethod = 
    | 'Keyboard'
    | 'MediaCapture'
    | 'ViewportChange'
    | 'VisibilityChange'
    | 'DeviceChange';
  
  export interface PreventionElements {
    overlay: HTMLDivElement;
    warning: HTMLDivElement;
    style: HTMLStyleElement;
  }
  
  export interface PreventionState {
    attemptCount: number;
    isBlurred: boolean;
    recoveryTimer: number | null;
  }
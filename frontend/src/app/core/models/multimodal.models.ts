export type SystemStateLevel = 'idle' | 'standby' | 'active_session' | 'auto_sleep' | 'teardown';

export type GestureType = 
  | 'pinch_click' 
  | 'swipe_left' 
  | 'swipe_right' 
  | 'thumbs_up' 
  | 'open_hand' 
  | 'closed_fist' 
  | 'none';

export interface VoiceIntent {
  action: string;
  text: string;
  confidence: number;
}

export interface MultimodalState {
  systemState: SystemStateLevel;
  cameraActive: boolean;
  microphoneActive: boolean;
  workerReady: boolean;
  currentGesture: GestureType;
  lastVoiceIntent: VoiceIntent | null;
}

// Payload optimizado para enviar desde el Worker al Hilo Principal (Zero Copy concept)
export interface GestureWorkerPayload {
  type: GestureType;
  confidence: number;
  cursorX?: number;
  cursorY?: number;
}

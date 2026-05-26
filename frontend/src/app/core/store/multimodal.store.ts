import { Injectable, computed, signal } from '@angular/core';
import { GestureType, MultimodalState, SystemStateLevel, VoiceIntent } from '../models/multimodal.models';

@Injectable({
  providedIn: 'root'
})
export class MultimodalStore {
  // Estado base inicial
  private readonly state = signal<MultimodalState>({
    systemState: 'idle',
    cameraActive: false,
    microphoneActive: false,
    workerReady: false,
    currentGesture: 'none',
    lastVoiceIntent: null
  });

  // Selectores (Computed Signals)
  public readonly systemState = computed(() => this.state().systemState);
  public readonly cameraActive = computed(() => this.state().cameraActive);
  public readonly microphoneActive = computed(() => this.state().microphoneActive);
  public readonly workerReady = computed(() => this.state().workerReady);
  public readonly currentGesture = computed(() => this.state().currentGesture);
  public readonly lastVoiceIntent = computed(() => this.state().lastVoiceIntent);

  // Acciones (Actualizadores de estado)
  public setSystemState(newState: SystemStateLevel): void {
    this.state.update(s => ({ ...s, systemState: newState }));
  }

  public setCameraActive(isActive: boolean): void {
    this.state.update(s => ({ ...s, cameraActive: isActive }));
  }

  public setMicrophoneActive(isActive: boolean): void {
    this.state.update(s => ({ ...s, microphoneActive: isActive }));
  }

  public setWorkerReady(isReady: boolean): void {
    this.state.update(s => ({ ...s, workerReady: isReady }));
  }

  public setGesture(gesture: GestureType): void {
    this.state.update(s => ({ ...s, currentGesture: gesture }));
  }

  public setVoiceIntent(intent: VoiceIntent): void {
    this.state.update(s => ({ ...s, lastVoiceIntent: intent }));
  }

  public resetSession(): void {
    this.state.set({
      systemState: 'idle',
      cameraActive: false,
      microphoneActive: false,
      workerReady: false,
      currentGesture: 'none',
      lastVoiceIntent: null
    });
  }
}

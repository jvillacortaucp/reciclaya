import { Injectable, inject, OnDestroy } from '@angular/core';
import { FilesetResolver, GestureRecognizer } from '@mediapipe/tasks-vision';
import { MultimodalStore } from '../../store/multimodal.store';
import { GestureType } from '../../models/multimodal.models';

@Injectable({
  providedIn: 'root'
})
export class GestureService implements OnDestroy {
  private readonly store = inject(MultimodalStore);
  private gestureRecognizer: GestureRecognizer | null = null;
  private videoElement: HTMLVideoElement | null = null;
  private stream: MediaStream | null = null;
  private animationFrameId: number | null = null;
  private lastFrameTime = 0;
  private readonly FRAME_INTERVAL = 1000 / 15; // 15 FPS

  constructor() {}

  public async startTracking(): Promise<void> {
    if (this.gestureRecognizer) return;

    try {
      // 1. Inicializar MediaPipe en el hilo principal (evita bug Vite+WASM+Worker)
      const vision = await FilesetResolver.forVisionTasks('/assets/wasm');
      this.gestureRecognizer = await GestureRecognizer.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: '/assets/models/gesture_recognizer.task',
          delegate: 'CPU'
        },
        runningMode: 'VIDEO',
        numHands: 1
      });

      this.store.setWorkerReady(true);
      console.log('[Gesture] MediaPipe inicializado correctamente.');

      // 2. Solicitar cámara a baja resolución
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 320 }, height: { ideal: 240 }, frameRate: { ideal: 15, max: 20 } }
      });

      this.videoElement = document.createElement('video');
      this.videoElement.srcObject = this.stream;
      this.videoElement.playsInline = true;
      await this.videoElement.play();
      this.store.setCameraActive(true);

      // 3. Iniciar el bucle de captura con throttling
      this.startThrottledLoop();

    } catch (err) {
      console.error('[Gesture] Error al iniciar:', err);
      this.store.setCameraActive(false);
      this.store.setSystemState('idle');
    }
  }

  private startThrottledLoop(): void {
    const loop = (timestamp: number) => {
      if (!this.gestureRecognizer || !this.videoElement || this.videoElement.readyState < 2) {
        this.animationFrameId = requestAnimationFrame(loop);
        return;
      }

      // Throttling: solo procesar cada ~66ms (15 FPS)
      if (timestamp - this.lastFrameTime >= this.FRAME_INTERVAL) {
        this.lastFrameTime = timestamp;
        try {
          const results = this.gestureRecognizer.recognizeForVideo(this.videoElement, performance.now());

          let detectedGesture: GestureType = 'none';
          if (results.gestures.length > 0 && results.gestures[0].length > 0) {
            const top = results.gestures[0][0];
            if (top.score > 0.6 && top.categoryName !== 'None') {
              detectedGesture = this.mapGesture(top.categoryName);
            }
          }

          if (detectedGesture !== this.store.currentGesture()) {
            this.store.setGesture(detectedGesture);
          }
        } catch (e) {
          console.debug('[Gesture] Frame processing skipped:', e);
        }
      }

      this.animationFrameId = requestAnimationFrame(loop);
    };

    this.animationFrameId = requestAnimationFrame(loop);
  }

  private mapGesture(categoryName: string): GestureType {
    const map: Record<string, GestureType> = {
      'Thumb_Up': 'thumbs_up',
      'Open_Palm': 'open_hand',
      'Closed_Fist': 'closed_fist',
      'Victory': 'swipe_right',
      'ILoveYou': 'swipe_left',
      'Pointing_Up': 'pinch_click'
    };
    return map[categoryName] ?? 'none';
  }

  public stopTracking(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach(t => t.stop());
      this.stream = null;
      this.store.setCameraActive(false);
    }
    if (this.videoElement) {
      this.videoElement.srcObject = null;
      this.videoElement = null;
    }
    if (this.gestureRecognizer) {
      this.gestureRecognizer.close();
      this.gestureRecognizer = null;
    }
    this.store.setWorkerReady(false);
    this.store.setGesture('none');
  }

  ngOnDestroy(): void {
    this.stopTracking();
  }
}


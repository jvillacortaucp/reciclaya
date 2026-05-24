import { Injectable, inject } from '@angular/core';
import { MultimodalStore } from '../../store/multimodal.store';

@Injectable({
  providedIn: 'root'
})
export class VoiceService {
  private readonly store = inject(MultimodalStore);
  private recognition: any;
  private isListening = false;

  constructor() {
    this.initSpeechRecognition();
  }

  private initSpeechRecognition(): void {
    const SpeechRecognition = (globalThis as any).SpeechRecognition || (globalThis as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = false;
      this.recognition.lang = 'es-ES'; // Idioma por defecto

      this.recognition.onstart = () => {
        this.isListening = true;
        this.store.setMicrophoneActive(true);
      };

      this.recognition.onresult = (event: any) => {
        const current = event.resultIndex;
        const transcript = event.results[current][0].transcript;
        const confidence = event.results[current][0].confidence;
        
        // Simulación de detección de "Intención" simple
        this.store.setVoiceIntent({
          action: 'transcription',
          text: transcript.trim(),
          confidence
        });
      };

      this.recognition.onerror = (event: any) => {
        console.error('Voice recognition error:', event.error);
        if (event.error === 'not-allowed') {
           this.store.setSystemState('idle');
           this.stopListening();
        }
      };

      this.recognition.onend = () => {
        this.isListening = false;
        this.store.setMicrophoneActive(false);
        
        // Si el estado del sistema sigue siendo active_session, intentar reiniciar
        if (this.store.systemState() === 'active_session') {
           try {
             this.recognition.start();
           } catch(e) {
              console.debug('[Voice] Could not restart recognition:', e);
            }
        }
      };
    } else {
      console.warn('Speech Recognition API not supported in this browser.');
    }
  }

  public startListening(): void {
    if (!this.recognition) return;
    
    if (this.store.systemState() !== 'active_session') {
      this.store.setSystemState('active_session');
    }

    if (!this.isListening) {
      try {
        this.recognition.start();
      } catch (e) {
        console.error('Could not start recognition:', e);
      }
    }
  }

  public stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
  }
}

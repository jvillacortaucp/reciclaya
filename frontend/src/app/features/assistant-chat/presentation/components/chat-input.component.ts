import { ChangeDetectionStrategy, Component, input, output, signal, OnDestroy, inject } from '@angular/core';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { LucideMic, LucideSendHorizontal, LucideSquare, LucideX } from '@lucide/angular';
import { ToastService } from '../../../../core/services/toast.service';

/** How long to wait (ms) after the last speech before auto-submitting. */
const SILENCE_TIMEOUT_MS = 2000;

@Component({
  selector: 'app-chat-input',
  standalone: true,
  imports: [ReactiveFormsModule, LucideMic, LucideSendHorizontal, LucideSquare, LucideX],
  template: `
    <form class="flex items-center gap-3" (submit)="$event.preventDefault(); !disabled() && submitMessage()">
      <div class="relative flex-1 group">
        <input
          [formControl]="control()"
          type="text"
          class="h-14 w-full rounded-2xl border border-slate-200/80 bg-slate-50/50 pl-5 pr-36 text-base text-slate-800 placeholder:text-slate-400/80 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-50 transition-all duration-300 sm:h-16 sm:rounded-3xl sm:text-base"
          [placeholder]="isRecording() ? 'Escuchando tu voz...' : placeholder()"
          [readOnly]="disabled() || isRecording()"
          [class.opacity-60]="disabled()"
          [class.border-emerald-400]="isRecording()"
          [class.ring-2]="isRecording()"
          [class.ring-emerald-100]="isRecording()" />

        <!-- Floating action area for voice, paperclip and char count -->
        <div class="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2.5 select-none">
          <!-- Voice Soundwave Animation when recording -->
          @if (isRecording()) {
            <div class="voice-wave animate-fade-in pr-1">
              <span class="voice-bar"></span>
              <span class="voice-bar"></span>
              <span class="voice-bar"></span>
              <span class="voice-bar"></span>
              <span class="voice-bar"></span>
            </div>

            <!-- Cancel Recording button -->
            <button
              type="button"
              (click)="cancelRecording()"
              class="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 border border-red-200 text-red-500 transition hover:bg-red-100 hover:text-red-600 focus:outline-none"
              title="Cancelar grabación">
              <svg lucideX class="h-4 w-4 fill-red-600 text-red-600"></svg>
            </button>
          }

          <span class="text-[11px] font-bold tracking-wider text-slate-400/70 bg-slate-100/50 px-2 py-0.5 rounded-full border border-slate-200/40 backdrop-blur-sm">
            {{ control().value.length }}/120
          </span>

          <span class="text-slate-300 hover:text-emerald-500 transition-colors cursor-pointer">
            <svg lucidePaperclip class="h-4.5 w-4.5"></svg>
          </span>

          <!-- Microphone / Recording toggle button -->
          <button
            type="button"
            (click)="toggleRecording()"
            [disabled]="disabled()"
            class="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 border border-slate-100 text-slate-400 transition hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-100 focus:outline-none disabled:opacity-50"
            [class.bg-emerald-100]="isRecording()"
            [class.border-emerald-200]="isRecording()"
            [class.text-emerald-600]="isRecording()"
            [class.animate-pulse]="isRecording()"
            [title]="isRecording() ? 'Detener grabación' : 'Grabar mensaje por voz'">
            @if (isRecording()) {
              <svg lucideSquare class="h-4 w-4 fill-emerald-600 text-emerald-600"></svg>
            } @else {
              <svg lucideMic class="h-4 w-4"></svg>
            }
          </button>
        </div>
      </div>

      <button
        type="submit"
        [disabled]="disabled() || isRecording() || !control().value.trim()"
        class="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md transition-all duration-300 hover:bg-emerald-700 hover:scale-105 active:scale-95 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-emerald-100 sm:h-14 sm:w-14 sm:rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 disabled:shadow-none">
        <svg lucideSendHorizontal class="h-5 w-5"></svg>
      </button>
    </form>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatInputComponent implements OnDestroy {
  control = input.required<FormControl<string>>();
  placeholder = input.required<string>();
  disabled = input<boolean>(false);
  submitted = output<void>();

  protected readonly isRecording = signal<boolean>(false);
  private recognition: any = null;
  private isCancelled = false;

  /** Timer that triggers auto-submit after silence. */
  private silenceTimer: ReturnType<typeof setTimeout> | null = null;

  /** Tracks the confirmed (final) transcript built across continuous results. */
  private confirmedTranscript = '';

  private readonly toastService = inject(ToastService);

  constructor() {
    this.initSpeechRecognition();
  }

  ngOnDestroy(): void {
    this.clearSilenceTimer();
    if (this.recognition) {
      try {
        this.recognition.abort();
      } catch (e) {
        console.warn('[Voice] Error aborting recognition on destroy:', e);
      }
    }
  }

  private initSpeechRecognition(): void {
    if (globalThis.window === undefined) {
      console.warn('[Voice] No window — SSR context, skipping');
      return;
    }

    const SpeechRecognition = (globalThis as any).SpeechRecognition || (globalThis as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('[Voice] SpeechRecognition API not available in this browser');
      return;
    }

    console.log('[Voice] Initializing SpeechRecognition...');
    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'es-ES';
    console.log('[Voice] Config: continuous=true, interimResults=true, lang=es-ES');

    this.recognition.onstart = () => {
      console.log('[Voice] ✅ onstart — recognition started successfully');
      this.isRecording.set(true);
      this.isCancelled = false;
      this.confirmedTranscript = '';
    };

    this.recognition.onend = () => {
      console.log('[Voice] onend — recognition ended. isCancelled:', this.isCancelled, 'confirmedTranscript:', this.confirmedTranscript);
      this.isRecording.set(false);
      this.clearSilenceTimer();

      // If not cancelled and we have text, auto-submit on natural end
      if (!this.isCancelled && this.confirmedTranscript.trim()) {
        console.log('[Voice] Auto-submitting after natural end');
        this.finalizeAndSubmit();
      }
    };

    this.recognition.onresult = (event: any) => {
      if (this.isCancelled) return;

      // Rebuild the entire string from scratch every time.
      // This completely eliminates ANY possibility of exponential duplication or stuttering.
      let fullText = '';
      for (const result of event.results) {
        const transcript = result[0].transcript;
        
        // HACK: Android Chrome Web Speech API cumulative bug fix
        // If the new transcript completely contains the previous fullText,
        // it means Android is accumulating the string natively. Overwrite instead of append.
        if (fullText && transcript.trim().toLowerCase().startsWith(fullText.trim().toLowerCase())) {
          fullText = transcript;
        } else {
          fullText += transcript;
        }
      }

      this.confirmedTranscript = fullText;

      const liveText = fullText.trim();
      console.log('[Voice] onresult — liveText:', liveText);
      this.control().setValue(liveText.substring(0, 120));

      // Reset the silence timer every time we get speech
      this.resetSilenceTimer();
    };

    this.recognition.onerror = (event: any) => {
      console.error('[Voice]  onerror — error:', event.error, 'message:', event.message, 'full event:', event);
      this.isRecording.set(false);
      this.clearSilenceTimer();
      if (this.isCancelled) {
        console.log('[Voice] Error ignored — recording was cancelled');
        return;
      }

      // 'no-speech' is expected when silence detection kicks in — don't show error
      if (event.error === 'no-speech') {
        console.log('[Voice] no-speech error — expected, ignoring');
        return;
      }

      let errorMsg = 'Error al grabar voz.';
      if (event.error === 'not-allowed') {
        errorMsg = 'No se puede acceder al micrófono. Por favor, habilita los permisos en tu navegador.';
      } else if (event.error === 'network') {
        console.warn('[Voice] Network error — Chrome requires internet for speech recognition (cloud-based)');
        errorMsg = 'Error de red: el reconocimiento de voz necesita conexión a internet. Verifica tu conexión y que accedas desde localhost.';
      } else if (event.error === 'aborted') {
        console.log('[Voice] aborted error — expected from abort(), ignoring');
        return; // Expected when we call abort()
      } else if (event.error === 'service-not-allowed') {
        errorMsg = 'El servicio de voz no está disponible. Asegúrate de usar Chrome/Edge y acceder desde localhost o HTTPS.';
      }
      this.toastService.error(errorMsg);
    };
  }

  /**
   * After SILENCE_TIMEOUT_MS of no new speech, stop recognition and submit.
   * This mimics Gemini's behavior: speak naturally, pause, it auto-sends.
   */
  private resetSilenceTimer(): void {
    this.clearSilenceTimer();
    this.silenceTimer = setTimeout(() => {
      if (this.isRecording() && !this.isCancelled) {
        // Stop listening — onend will trigger finalizeAndSubmit
        try {
          this.recognition.stop();
        } catch (e) {
          console.warn('[Voice] Error stopping in silence timer:', e);
        }
      }
    }, SILENCE_TIMEOUT_MS);
  }

  private clearSilenceTimer(): void {
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }
  }

  /**
   * Finalize the transcript and submit the message.
   */
  private finalizeAndSubmit(): void {
    const text = this.control().value?.trim();
    if (!text) return;

    if (text.length > 120) {
      this.toastService.error('El mensaje de voz excede el límite máximo de 120 caracteres. Por favor acórtalo.');
      this.control().setValue(text.substring(0, 120));
      return;
    }

    // Small delay to let the user see the final text before it sends
    setTimeout(() => {
      if (!this.isCancelled) {
        this.submitted.emit();
      }
    }, 300);
  }

  protected toggleRecording(): void {
    console.log('[Voice] toggleRecording called. recognition:', !!this.recognition, 'isRecording:', this.isRecording());

    if (!this.recognition) {
      console.warn('[Voice] No recognition object — browser not supported');
      this.toastService.info('Tu navegador no soporta el reconocimiento de voz. Intenta usar Chrome o Edge.');
      return;
    }

    if (this.isRecording()) {
      console.log('[Voice] Stopping recording...');
      // Manual stop — will trigger onend → finalizeAndSubmit
      try {
        this.recognition.stop();
      } catch (e) {
        console.error('[Voice] Error stopping:', e);
      }
    } else {
      console.log('[Voice] Starting recording...');
      try {
        this.isCancelled = false;
        this.confirmedTranscript = '';
        this.recognition.start();
        console.log('[Voice] recognition.start() called successfully');
      } catch (e) {
        console.error('[Voice] ❌ Error starting recognition:', e);
        // If recognition is stuck, try aborting and restarting
        try {
          console.log('[Voice] Attempting abort + restart...');
          this.recognition.abort();
          setTimeout(() => {
            try {
              this.recognition.start();
              console.log('[Voice] Restart after abort succeeded');
            } catch (error_) {
              console.error('[Voice] ❌ Restart after abort also failed:', error_);
              this.toastService.error('Error al iniciar el micrófono. Recarga la página e intenta de nuevo.');
            }
          }, 200);
        } catch (abortError) {
          console.error('[Voice] Abort also failed:', abortError);
        }
      }
    }
  }

  protected cancelRecording(): void {
    if (this.recognition && this.isRecording()) {
      this.isCancelled = true;
      this.clearSilenceTimer();
      this.confirmedTranscript = '';
      // Restore input to empty (discard voice input)
      this.control().setValue('');
      try {
        this.recognition.abort();
      } catch (e) {
        console.warn('[Voice] Error aborting on cancel:', e);
      }
      this.isRecording.set(false);
    }
  }

  protected submitMessage(): void {
    if (this.control().invalid || !this.control().value?.trim()) return;
    this.submitted.emit();
  }
}
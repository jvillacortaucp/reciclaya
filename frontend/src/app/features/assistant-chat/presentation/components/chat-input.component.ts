import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { LucideMic, LucideSendHorizontal, LucideSquare } from '@lucide/angular';

@Component({
  selector: 'app-chat-input',
  standalone: true,
  imports: [ReactiveFormsModule, LucideMic, LucideSendHorizontal, LucideSquare],
  template: `
    <form class="flex items-center gap-3" (submit)="$event.preventDefault(); !disabled() && submitMessage()">
      <div class="relative flex-1">
        <input
          [formControl]="control()"
          type="text"
          class="h-14 w-full rounded-2xl border border-slate-200 bg-white pl-5 pr-24 text-base text-slate-700 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100 sm:h-16 sm:rounded-3xl sm:text-lg"
          [placeholder]="isRecording() ? 'Escuchando tu voz...' : placeholder()"
          [readOnly]="disabled() || isRecording()"
          [class.opacity-60]="disabled()" />

        <div class="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
          <!-- Voice Soundwave Animation when recording -->
          @if (isRecording()) {
            <div class="voice-wave animate-fade-in pr-1">
              <span class="voice-bar"></span>
              <span class="voice-bar"></span>
              <span class="voice-bar"></span>
              <span class="voice-bar"></span>
              <span class="voice-bar"></span>
            </div>
          }

          <!-- Microphone / Recording toggle button -->
          <button
            type="button"
            (click)="toggleRecording()"
            [disabled]="disabled()"
            class="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 border border-slate-200 text-slate-500 transition hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-100 focus:outline-none disabled:opacity-50"
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
        [disabled]="disabled() || isRecording()"
        class="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-200 sm:h-14 sm:w-14 sm:rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed">
        <svg lucideSendHorizontal class="h-5 w-5"></svg>
      </button>
    </form>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatInputComponent {
  control = input.required<FormControl<string>>();
  placeholder = input.required<string>();
  disabled = input<boolean>(false);
  submitted = output<void>();

  protected readonly isRecording = signal<boolean>(false);
  private recognition: any = null;

  constructor() {
    this.initSpeechRecognition();
  }

  private initSpeechRecognition(): void {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'es-ES';

      this.recognition.onstart = () => {
        this.isRecording.set(true);
      };

      this.recognition.onend = () => {
        this.isRecording.set(false);
      };

      this.recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          const currentText = this.control().value || '';
          this.control().setValue(currentText ? `${currentText.trim()} ${transcript}` : transcript);
          
          // Submit instantly like Gemini/ChatGPT!
          setTimeout(() => {
            this.submitted.emit();
          }, 300);
        }
      };

      this.recognition.onerror = (event: any) => {
        this.isRecording.set(false);
      };
    }
  }

  protected toggleRecording(): void {
    if (!this.recognition) {
      alert('Tu navegador no soporta el reconocimiento de voz. Intenta usar Chrome o Edge.');
      return;
    }

    if (this.isRecording()) {
      this.recognition.stop();
    } else {
      try {
        this.recognition.start();
      } catch (e) {
        // Recognition already started or error
      }
    }
  }

  protected submitMessage(): void {
    if (this.control().invalid || !this.control().value?.trim()) return;
    this.submitted.emit();
  }
}

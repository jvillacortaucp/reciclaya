import { Injectable } from '@angular/core';
import { Notyf } from 'notyf';

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly notyf = new Notyf({
    duration: 2600,
    position: { x: 'right', y: 'top' },
    dismissible: true,
    ripple: true
  });

  success(message: string): void {
    this.notyf.success(message);
  }

  error(message: string): void {
    this.notyf.error(message);
  }

  info(message: string): void {
    this.notyf.open({
      type: 'info',
      message,
      background: '#0f172a',
      icon: false
    });
  }
}

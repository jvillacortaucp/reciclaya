import { TestBed } from '@angular/core/testing';
import { ChatInputComponent } from './chat-input.component';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { describe, it, expect } from 'vitest';

describe('ChatInputComponent', () => {
  it('should create the input component instance correctly', () => {
    TestBed.configureTestingModule({
      imports: [ChatInputComponent, ReactiveFormsModule]
    });

    const fixture = TestBed.createComponent(ChatInputComponent);
    const component = fixture.componentInstance;
    
    expect(component).toBeDefined();
  });

  it('should set required signals correctly', () => {
    TestBed.configureTestingModule({
      imports: [ChatInputComponent, ReactiveFormsModule]
    });

    const fixture = TestBed.createComponent(ChatInputComponent);
    const component = fixture.componentInstance;
    
    const control = new FormControl<string>('Hola mundo', { nonNullable: true });
    fixture.componentRef.setInput('control', control);
    fixture.componentRef.setInput('placeholder', 'Escribe algo...');

    fixture.detectChanges();

    expect(component.control().value).toBe('Hola mundo');
    expect(component.placeholder()).toBe('Escribe algo...');
  });
});

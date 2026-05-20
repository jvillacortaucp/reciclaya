import { TestBed } from '@angular/core/testing';
import { ChatMessageBubbleComponent } from './chat-message-bubble.component';
import { ChatMessage } from '../../models/assistant-chat.model';
import { describe, it, expect } from 'vitest';

describe('ChatMessageBubbleComponent', () => {
  it('should create the component instance correctly', () => {
    TestBed.configureTestingModule({
      imports: [ChatMessageBubbleComponent]
    });

    const fixture = TestBed.createComponent(ChatMessageBubbleComponent);
    const component = fixture.componentInstance;
    
    expect(component).toBeDefined();
  });

  it('should correctly set input signals', () => {
    TestBed.configureTestingModule({
      imports: [ChatMessageBubbleComponent]
    });

    const fixture = TestBed.createComponent(ChatMessageBubbleComponent);
    const component = fixture.componentInstance;
    
    const message: ChatMessage = {
      id: 'msg-1',
      role: 'assistant',
      content: '¡Hola! Soy ReciclaIA.',
      createdAt: new Date().toISOString(),
      type: 'text'
    };

    fixture.componentRef.setInput('message', message);
    fixture.detectChanges();

    expect(component.message().content).toBe('¡Hola! Soy ReciclaIA.');
  });
});

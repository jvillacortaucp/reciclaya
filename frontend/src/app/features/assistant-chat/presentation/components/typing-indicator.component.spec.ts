import { TestBed } from '@angular/core/testing';
import { TypingIndicatorComponent } from './typing-indicator.component';
import { describe, it, expect } from 'vitest';

describe('TypingIndicatorComponent', () => {
  it('should create the component instance correctly', () => {
    TestBed.configureTestingModule({
      imports: [TypingIndicatorComponent]
    });

    const fixture = TestBed.createComponent(TypingIndicatorComponent);
    const component = fixture.componentInstance;
    
    expect(component).toBeDefined();
  });
});

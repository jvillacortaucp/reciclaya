import { TestBed } from '@angular/core/testing';
import { ProductSuggestionCardComponent } from './product-suggestion-card.component';
import { ProductSuggestion } from '../../models/assistant-chat.model';
import { describe, it, expect } from 'vitest';

describe('ProductSuggestionCardComponent', () => {
  it('should create the component instance correctly', () => {
    TestBed.configureTestingModule({
      imports: [ProductSuggestionCardComponent]
    });

    const fixture = TestBed.createComponent(ProductSuggestionCardComponent);
    const component = fixture.componentInstance;
    
    expect(component).toBeDefined();
  });

  it('should display suggestion details correctly', () => {
    TestBed.configureTestingModule({
      imports: [ProductSuggestionCardComponent]
    });

    const fixture = TestBed.createComponent(ProductSuggestionCardComponent);
    const component = fixture.componentInstance;
    
    const suggestion: ProductSuggestion = {
      id: 'prod-1',
      productName: 'Bio-plástico',
      sectorName: 'Manufactura',
      description: 'Una alternativa biodegradable a plásticos convencionales.',
      complexity: 'medium',
      marketPotential: 'high',
      residueInput: 'Cáscaras de plátano',
      iconName: 'recycle',
      listingId: null
    };

    fixture.componentRef.setInput('suggestion', suggestion);
    fixture.detectChanges();

    expect(component.suggestion().productName).toBe('Bio-plástico');
    expect(component.suggestion().complexity).toBe('medium');
  });
});

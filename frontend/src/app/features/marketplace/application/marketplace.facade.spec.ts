import { TestBed } from '@angular/core/testing';
import { MarketplaceFacade } from './marketplace.facade';
import { MarketplaceRepository } from '../infrastructure/marketplace.repository';
import { describe, it, expect, vi } from 'vitest';

describe('MarketplaceFacade', () => {
  const mockMarketplaceRepository = {
    getDataset: vi.fn(),
    getListings: vi.fn(),
    detail: vi.fn()
  };

  it('should be created correctly', () => {
    TestBed.configureTestingModule({
      providers: [
        MarketplaceFacade,
        { provide: MarketplaceRepository, useValue: mockMarketplaceRepository }
      ]
    });

    const facade = TestBed.inject(MarketplaceFacade);
    expect(facade).toBeDefined();
    expect(facade.loading()).toBe(false);
  });
});

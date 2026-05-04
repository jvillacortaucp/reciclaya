import { TestBed } from '@angular/core/testing';
import { DashboardImpactFacade } from './dashboard-impact.facade';
import { DashboardImpactService } from '../infrastructure/dashboard-impact.service';
import { describe, it, expect, vi } from 'vitest';

describe('DashboardImpactFacade', () => {
  const mockDashboardImpactService = {
    getImpactData: vi.fn()
  };

  it('should create the dashboard facade instance', () => {
    TestBed.configureTestingModule({
      providers: [
        DashboardImpactFacade,
        { provide: DashboardImpactService, useValue: mockDashboardImpactService }
      ]
    });

    const facade = TestBed.inject(DashboardImpactFacade);
    expect(facade).toBeDefined();
    expect(facade.loading()).toBe(false);
  });
});

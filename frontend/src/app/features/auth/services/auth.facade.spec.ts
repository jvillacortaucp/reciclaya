import { TestBed } from '@angular/core/testing';
import { AuthFacade } from './auth.facade';
import { AuthHttpRepository } from '../infrastructure/auth-http.repository';
import { SessionStorageService } from '../../../core/services/session-storage.service';
import { Router } from '@angular/router';
import { describe, it, expect, vi } from 'vitest';
import { signal } from '@angular/core';

describe('AuthFacade', () => {
  const mockAuthRepository = {
    loginWithEmail: vi.fn(),
    registerCompany: vi.fn(),
    registerNaturalPerson: vi.fn(),
    getMe: vi.fn()
  };

  const mockSessionStorage = {
    session: signal(null),
    set: vi.fn(),
    clear: vi.fn()
  };

  const mockRouter = {
    navigateByUrl: vi.fn(),
    parseUrl: vi.fn().mockReturnValue({ queryParams: {} }),
    url: ''
  };

  it('should be created correctly', () => {
    TestBed.configureTestingModule({
      providers: [
        AuthFacade,
        { provide: AuthHttpRepository, useValue: mockAuthRepository },
        { provide: SessionStorageService, useValue: mockSessionStorage },
        { provide: Router, useValue: mockRouter }
      ]
    });

    const facade = TestBed.inject(AuthFacade);
    expect(facade).toBeDefined();
    expect(facade.isAuthenticated()).toBe(false);
  });
});

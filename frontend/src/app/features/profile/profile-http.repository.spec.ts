import { TestBed } from '@angular/core/testing';
import { ProfileHttpRepository } from './profile-http.repository';
import { HttpClient } from '@angular/common/http';
import { describe, it, expect, vi } from 'vitest';

describe('ProfileHttpRepository', () => {
  const mockHttpClient = {
    get: vi.fn(),
    put: vi.fn()
  };

  it('should be created correctly', () => {
    TestBed.configureTestingModule({
      providers: [
        ProfileHttpRepository,
        { provide: HttpClient, useValue: mockHttpClient }
      ]
    });

    const repository = TestBed.inject(ProfileHttpRepository);
    expect(repository).toBeDefined();
  });
});

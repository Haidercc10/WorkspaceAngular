import { TestBed } from '@angular/core/testing';

import { RoleGuardServiceGuard } from './role-guard-service.guard';

describe('RoleGuardServiceGuard', () => {
  let guard: RoleGuardServiceGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(RoleGuardServiceGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';

import { ValidacionLoginGuard } from './validacion-login.guard';

describe('ValidacionLoginGuard', () => {
  let guard: ValidacionLoginGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(ValidacionLoginGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});

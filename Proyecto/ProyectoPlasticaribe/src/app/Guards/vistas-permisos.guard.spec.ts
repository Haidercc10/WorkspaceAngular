import { TestBed } from '@angular/core/testing';

import { VistasPermisosGuard } from './vistas-permisos.guard';

describe('VistasPermisosGuard', () => {
  let guard: VistasPermisosGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(VistasPermisosGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});

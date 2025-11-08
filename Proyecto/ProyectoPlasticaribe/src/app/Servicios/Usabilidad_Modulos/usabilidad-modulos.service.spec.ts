import { TestBed } from '@angular/core/testing';

import { UsabilidadModulosService } from './usabilidad-modulos.service';

describe('UsabilidadModulosService', () => {
  let service: UsabilidadModulosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UsabilidadModulosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

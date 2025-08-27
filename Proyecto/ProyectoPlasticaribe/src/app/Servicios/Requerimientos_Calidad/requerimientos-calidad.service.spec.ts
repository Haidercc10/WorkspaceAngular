import { TestBed } from '@angular/core/testing';

import { RequerimientosCalidadService } from './requerimientos-calidad.service';

describe('RequerimientosCalidadService', () => {
  let service: RequerimientosCalidadService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RequerimientosCalidadService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

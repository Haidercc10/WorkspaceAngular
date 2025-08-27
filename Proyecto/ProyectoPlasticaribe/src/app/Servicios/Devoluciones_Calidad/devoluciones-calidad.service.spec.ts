import { TestBed } from '@angular/core/testing';

import { DevolucionesCalidadService } from './devoluciones-calidad.service';

describe('DevolucionesCalidadService', () => {
  let service: DevolucionesCalidadService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DevolucionesCalidadService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

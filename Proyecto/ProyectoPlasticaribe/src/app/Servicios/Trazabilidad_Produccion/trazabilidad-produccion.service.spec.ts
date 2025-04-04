import { TestBed } from '@angular/core/testing';

import { TrazabilidadProduccionService } from './trazabilidad-produccion.service';

describe('TrazabilidadProduccionService', () => {
  let service: TrazabilidadProduccionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TrazabilidadProduccionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

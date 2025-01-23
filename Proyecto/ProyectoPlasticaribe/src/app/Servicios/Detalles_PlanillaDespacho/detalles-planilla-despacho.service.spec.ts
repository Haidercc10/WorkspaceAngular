import { TestBed } from '@angular/core/testing';

import { DetallesPlanillaDespachoService } from './detalles-planilla-despacho.service';

describe('DetallesPlanillaDespachoService', () => {
  let service: DetallesPlanillaDespachoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DetallesPlanillaDespachoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

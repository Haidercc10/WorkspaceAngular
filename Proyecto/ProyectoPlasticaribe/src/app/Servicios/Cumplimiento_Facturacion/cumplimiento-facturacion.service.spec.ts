import { TestBed } from '@angular/core/testing';

import { CumplimientoFacturacionService } from './cumplimiento-facturacion.service';

describe('CumplimientoFacturacionService', () => {
  let service: CumplimientoFacturacionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CumplimientoFacturacionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

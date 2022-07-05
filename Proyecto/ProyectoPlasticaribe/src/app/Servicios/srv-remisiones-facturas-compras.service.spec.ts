import { TestBed } from '@angular/core/testing';

import { SrvRemisionesFacturasComprasService } from './srv-remisiones-facturas-compras.service';

describe('SrvRemisionesFacturasComprasService', () => {
  let service: SrvRemisionesFacturasComprasService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SrvRemisionesFacturasComprasService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

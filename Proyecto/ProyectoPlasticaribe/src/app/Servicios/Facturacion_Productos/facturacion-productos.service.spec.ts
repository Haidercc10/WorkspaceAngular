import { TestBed } from '@angular/core/testing';

import { FacturacionProductosService } from './facturacion-productos.service';

describe('FacturacionProductosService', () => {
  let service: FacturacionProductosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FacturacionProductosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

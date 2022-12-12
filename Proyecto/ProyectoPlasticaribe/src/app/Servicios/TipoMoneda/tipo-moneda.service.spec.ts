import { TestBed } from '@angular/core/testing';

import { TipoMonedaService } from './tipo-moneda.service';

describe('TipoMonedaService', () => {
  let service: TipoMonedaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TipoMonedaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

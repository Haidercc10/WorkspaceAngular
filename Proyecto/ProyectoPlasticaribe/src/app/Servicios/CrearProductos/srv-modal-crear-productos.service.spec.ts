import { TestBed } from '@angular/core/testing';

import { SrvModalCrearProductosService } from './srv-modal-crear-productos.service';

describe('SrvModalCrearProductosService', () => {
  let service: SrvModalCrearProductosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SrvModalCrearProductosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

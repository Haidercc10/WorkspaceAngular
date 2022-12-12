import { TestBed } from '@angular/core/testing';

import { ExistenciasProductosService } from './existencias-productos.service';

describe('ExistenciasProductosService', () => {
  let service: ExistenciasProductosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExistenciasProductosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';

import { TipoEstadosService } from './tipo-estados.service';

describe('TipoEstadosService', () => {
  let service: TipoEstadosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TipoEstadosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

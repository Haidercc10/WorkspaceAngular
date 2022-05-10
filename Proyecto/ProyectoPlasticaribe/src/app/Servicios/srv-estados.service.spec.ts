import { TestBed } from '@angular/core/testing';

import { SrvEstadosService } from './srv-estados.service';

describe('SrvEstadosService', () => {
  let service: SrvEstadosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SrvEstadosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

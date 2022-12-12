import { TestBed } from '@angular/core/testing';

import { SrvInsumosService } from './srv-insumos.service';

describe('SrvInsumosService', () => {
  let service: SrvInsumosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SrvInsumosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

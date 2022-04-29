import { TestBed } from '@angular/core/testing';

import { CajacompensacionService } from './cajacompensacion.service';

describe('CajacompensacionService', () => {
  let service: CajacompensacionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CajacompensacionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

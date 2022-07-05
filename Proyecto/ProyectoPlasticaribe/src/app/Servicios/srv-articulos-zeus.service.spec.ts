import { TestBed } from '@angular/core/testing';

import { SrvArticulosZeusService } from './srv-articulos-zeus.service';

describe('SrvArticulosZeusService', () => {
  let service: SrvArticulosZeusService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SrvArticulosZeusService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

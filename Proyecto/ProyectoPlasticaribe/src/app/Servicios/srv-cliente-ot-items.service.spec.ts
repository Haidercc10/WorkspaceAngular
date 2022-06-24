import { TestBed } from '@angular/core/testing';

import { SrvClienteOtItemsService } from './srv-cliente-ot-items.service';

describe('SrvClienteOtItemsService', () => {
  let service: SrvClienteOtItemsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SrvClienteOtItemsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

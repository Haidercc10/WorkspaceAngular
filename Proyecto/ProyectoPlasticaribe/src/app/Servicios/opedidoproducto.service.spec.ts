import { TestBed } from '@angular/core/testing';

import { OpedidoproductoService } from './opedidoproducto.service';

describe('OpedidoproductoService', () => {
  let service: OpedidoproductoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OpedidoproductoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

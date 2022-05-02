import { TestBed } from '@angular/core/testing';

import { OpedidoService } from './opedido.service';

describe('OpedidoService', () => {
  let service: OpedidoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OpedidoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

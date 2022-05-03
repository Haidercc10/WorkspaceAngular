import { TestBed } from '@angular/core/testing';

import { PedidomateriaprimaService } from './pedidomateriaprima.service';

describe('PedidomateriaprimaService', () => {
  let service: PedidomateriaprimaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PedidomateriaprimaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';

import { InventarioZeusService } from './inventario-zeus.service';

describe('InventarioZeusService', () => {
  let service: InventarioZeusService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InventarioZeusService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

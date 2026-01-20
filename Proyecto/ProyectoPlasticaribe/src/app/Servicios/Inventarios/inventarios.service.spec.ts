import { TestBed } from '@angular/core/testing';

import { InventariosService } from './inventarios.service';

describe('InventariosService', () => {
  let service: InventariosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InventariosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

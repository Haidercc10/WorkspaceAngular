import { TestBed } from '@angular/core/testing';

import { CrearProveedorService } from './crear-proveedor.service';

describe('CrearProveedorService', () => {
  let service: CrearProveedorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CrearProveedorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

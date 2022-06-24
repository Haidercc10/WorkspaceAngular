/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { ProveedorService } from './proveedor.service';

describe('Service: Proveedor', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ProveedorService]
    });
  });

  it('should ...', inject([ProveedorService], (service: ProveedorService) => {
    expect(service).toBeTruthy();
  }));
});

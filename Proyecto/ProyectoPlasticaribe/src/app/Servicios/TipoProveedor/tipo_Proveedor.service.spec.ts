/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { Tipo_ProveedorService } from './tipo_Proveedor.service';

describe('Service: Tipo_Proveedor', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [Tipo_ProveedorService]
    });
  });

  it('should ...', inject([Tipo_ProveedorService], (service: Tipo_ProveedorService) => {
    expect(service).toBeTruthy();
  }));
});

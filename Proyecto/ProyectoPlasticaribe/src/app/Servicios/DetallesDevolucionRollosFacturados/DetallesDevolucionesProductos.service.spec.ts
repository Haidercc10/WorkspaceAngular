/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { DetallesDevolucionesProductosService } from './DetallesDevolucionesProductos.service';

describe('Service: DetallesDevolucionesProductos', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DetallesDevolucionesProductosService]
    });
  });

  it('should ...', inject([DetallesDevolucionesProductosService], (service: DetallesDevolucionesProductosService) => {
    expect(service).toBeTruthy();
  }));
});

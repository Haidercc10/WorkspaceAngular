/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { DevolucionesProductosService } from './DevolucionesProductos.service';

describe('Service: DevolucionesProductos', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DevolucionesProductosService]
    });
  });

  it('should ...', inject([DevolucionesProductosService], (service: DevolucionesProductosService) => {
    expect(service).toBeTruthy();
  }));
});

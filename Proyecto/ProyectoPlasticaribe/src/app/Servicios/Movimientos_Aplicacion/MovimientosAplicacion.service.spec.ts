/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { MovimientosAplicacionService } from './MovimientosAplicacion.service';

describe('Service: MovimientosAplicacion', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MovimientosAplicacionService]
    });
  });

  it('should ...', inject([MovimientosAplicacionService], (service: MovimientosAplicacionService) => {
    expect(service).toBeTruthy();
  }));
});

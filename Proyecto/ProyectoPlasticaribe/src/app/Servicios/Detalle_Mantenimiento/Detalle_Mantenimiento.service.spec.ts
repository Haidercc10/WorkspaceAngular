/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { Detalle_MantenimientoService } from './Detalle_Mantenimiento.service';

describe('Service: Detalle_Mantenimiento', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [Detalle_MantenimientoService]
    });
  });

  it('should ...', inject([Detalle_MantenimientoService], (service: Detalle_MantenimientoService) => {
    expect(service).toBeTruthy();
  }));
});

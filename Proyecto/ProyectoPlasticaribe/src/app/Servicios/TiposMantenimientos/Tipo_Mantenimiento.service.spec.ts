/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { Tipo_MantenimientoService } from './Tipo_Mantenimiento.service';

describe('Service: Tipo_Mantenimiento', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [Tipo_MantenimientoService]
    });
  });

  it('should ...', inject([Tipo_MantenimientoService], (service: Tipo_MantenimientoService) => {
    expect(service).toBeTruthy();
  }));
});

/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { DetallePedido_MantenimientoService } from './DetallePedido_Mantenimiento.service';

describe('Service: DetallePedido_Mantenimiento', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DetallePedido_MantenimientoService]
    });
  });

  it('should ...', inject([DetallePedido_MantenimientoService], (service: DetallePedido_MantenimientoService) => {
    expect(service).toBeTruthy();
  }));
});

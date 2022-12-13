/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { Pedido_MantenimientoService } from './Pedido_Mantenimiento.service';

describe('Service: Pedido_Mantenimiento', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [Pedido_MantenimientoService]
    });
  });

  it('should ...', inject([Pedido_MantenimientoService], (service: Pedido_MantenimientoService) => {
    expect(service).toBeTruthy();
  }));
});

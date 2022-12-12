/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { PedidoProductosService } from './pedidoProductos.service';

describe('Service: PedidoProductos', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PedidoProductosService]
    });
  });

  it('should ...', inject([PedidoProductosService], (service: PedidoProductosService) => {
    expect(service).toBeTruthy();
  }));
});

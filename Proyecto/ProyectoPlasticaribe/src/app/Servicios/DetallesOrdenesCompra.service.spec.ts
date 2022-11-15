/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { DetallesOrdenesCompraService } from './DetallesOrdenesCompra.service';

describe('Service: DetallesOrdenesCompra', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DetallesOrdenesCompraService]
    });
  });

  it('should ...', inject([DetallesOrdenesCompraService], (service: DetallesOrdenesCompraService) => {
    expect(service).toBeTruthy();
  }));
});

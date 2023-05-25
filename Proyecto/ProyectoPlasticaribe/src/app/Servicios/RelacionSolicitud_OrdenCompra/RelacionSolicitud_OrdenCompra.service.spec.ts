/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { RelacionSolicitud_OrdenCompraService } from './RelacionSolicitud_OrdenCompra.service';

describe('Service: RelacionSolicitud_OrdenCompra', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RelacionSolicitud_OrdenCompraService]
    });
  });

  it('should ...', inject([RelacionSolicitud_OrdenCompraService], (service: RelacionSolicitud_OrdenCompraService) => {
    expect(service).toBeTruthy();
  }));
});

/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { DetallesAsignacionProductosFacturaService } from './DetallesAsignacionProductosFactura.service';

describe('Service: DetallesAsignacionProductosFactura', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DetallesAsignacionProductosFacturaService]
    });
  });

  it('should ...', inject([DetallesAsignacionProductosFacturaService], (service: DetallesAsignacionProductosFacturaService) => {
    expect(service).toBeTruthy();
  }));
});

/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { AsignacionProductosFacturaService } from './AsignacionProductosFactura.service';

describe('Service: AsignacionProductosFactura', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AsignacionProductosFacturaService]
    });
  });

  it('should ...', inject([AsignacionProductosFacturaService], (service: AsignacionProductosFacturaService) => {
    expect(service).toBeTruthy();
  }));
});

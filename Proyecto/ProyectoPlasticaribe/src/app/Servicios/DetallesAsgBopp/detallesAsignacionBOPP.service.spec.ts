/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { DetalleAsignacion_BOPPService } from './detallesAsignacionBOPP.service';

describe('Service: DetallesAsignacionBOPP', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DetalleAsignacion_BOPPService]
    });
  });

  it('should ...', inject([DetalleAsignacion_BOPPService], (service: DetalleAsignacion_BOPPService) => {
    expect(service).toBeTruthy();
  }));
});

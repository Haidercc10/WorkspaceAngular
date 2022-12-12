/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { DetallesAsignacionService } from './detallesAsignacion.service';

describe('Service: DetallesAsignacion', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DetallesAsignacionService]
    });
  });

  it('should ...', inject([DetallesAsignacionService], (service: DetallesAsignacionService) => {
    expect(service).toBeTruthy();
  }));
});

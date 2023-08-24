/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { Certificados_CalidadService } from './Certificados_Calidad.service';

describe('Service: Certificados_Calidad', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [Certificados_CalidadService]
    });
  });

  it('should ...', inject([Certificados_CalidadService], (service: Certificados_CalidadService) => {
    expect(service).toBeTruthy();
  }));
});

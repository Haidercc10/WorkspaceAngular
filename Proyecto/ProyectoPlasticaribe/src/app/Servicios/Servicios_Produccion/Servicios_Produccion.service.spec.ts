/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { Servicios_ProduccionService } from './Servicios_Produccion.service';

describe('Service: Servicios_Produccion', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [Servicios_ProduccionService]
    });
  });

  it('should ...', inject([Servicios_ProduccionService], (service: Servicios_ProduccionService) => {
    expect(service).toBeTruthy();
  }));
});

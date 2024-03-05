/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { Prestamos_NominaService } from './Prestamos_Nomina.service';

describe('Service: Prestamos_Nomina', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [Prestamos_NominaService]
    });
  });

  it('should ...', inject([Prestamos_NominaService], (service: Prestamos_NominaService) => {
    expect(service).toBeTruthy();
  }));
});

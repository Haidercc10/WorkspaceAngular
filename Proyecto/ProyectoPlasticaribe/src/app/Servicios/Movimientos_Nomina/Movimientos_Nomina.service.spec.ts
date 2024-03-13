/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { Movimientos_NominaService } from './Movimientos_Nomina.service';

describe('Service: Movimientos_Nomina', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [Movimientos_NominaService]
    });
  });

  it('should ...', inject([Movimientos_NominaService], (service: Movimientos_NominaService) => {
    expect(service).toBeTruthy();
  }));
});

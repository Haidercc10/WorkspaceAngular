/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { Tipos_NominaService } from './Tipos_Nomina.service';

describe('Service: Tipos_Nomina', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [Tipos_NominaService]
    });
  });

  it('should ...', inject([Tipos_NominaService], (service: Tipos_NominaService) => {
    expect(service).toBeTruthy();
  }));
});

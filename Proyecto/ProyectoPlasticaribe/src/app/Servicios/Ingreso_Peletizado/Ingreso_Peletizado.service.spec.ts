/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { Ingreso_PeletizadoService } from './Ingreso_Peletizado.service';

describe('Service: Ingreso_Peletizado', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [Ingreso_PeletizadoService]
    });
  });

  it('should ...', inject([Ingreso_PeletizadoService], (service: Ingreso_PeletizadoService) => {
    expect(service).toBeTruthy();
  }));
});

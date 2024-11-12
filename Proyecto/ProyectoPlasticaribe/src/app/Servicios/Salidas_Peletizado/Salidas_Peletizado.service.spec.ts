/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { Salidas_PeletizadoService } from './Salidas_Peletizado.service';

describe('Service: Salidas_Peletizado', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [Salidas_PeletizadoService]
    });
  });

  it('should ...', inject([Salidas_PeletizadoService], (service: Salidas_PeletizadoService) => {
    expect(service).toBeTruthy();
  }));
});

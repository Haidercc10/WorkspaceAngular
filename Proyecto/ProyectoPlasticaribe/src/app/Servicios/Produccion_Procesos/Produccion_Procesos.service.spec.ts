/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { Produccion_ProcesosService } from './Produccion_Procesos.service';

describe('Service: Produccion_Procesos', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [Produccion_ProcesosService]
    });
  });

  it('should ...', inject([Produccion_ProcesosService], (service: Produccion_ProcesosService) => {
    expect(service).toBeTruthy();
  }));
});

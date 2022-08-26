/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { Tipos_ImpresionService } from './Tipos_Impresion.service';

describe('Service: Tipos_Impresion', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [Tipos_ImpresionService]
    });
  });

  it('should ...', inject([Tipos_ImpresionService], (service: Tipos_ImpresionService) => {
    expect(service).toBeTruthy();
  }));
});

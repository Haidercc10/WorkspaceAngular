/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { Tipo_ActivoService } from './Tipo_Activo.service';

describe('Service: Tipo_Activo', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [Tipo_ActivoService]
    });
  });

  it('should ...', inject([Tipo_ActivoService], (service: Tipo_ActivoService) => {
    expect(service).toBeTruthy();
  }));
});

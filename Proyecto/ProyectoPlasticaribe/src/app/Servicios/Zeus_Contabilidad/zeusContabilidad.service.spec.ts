/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { ZeusContabilidadService } from './zeusContabilidad.service';

describe('Service: ZeusContabilidad', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ZeusContabilidadService]
    });
  });

  it('should ...', inject([ZeusContabilidadService], (service: ZeusContabilidadService) => {
    expect(service).toBeTruthy();
  }));
});

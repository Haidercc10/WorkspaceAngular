/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { PruebaArchivosService } from './pruebaArchivos.service';

describe('Service: PruebaArchivos', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PruebaArchivosService]
    });
  });

  it('should ...', inject([PruebaArchivosService], (service: PruebaArchivosService) => {
    expect(service).toBeTruthy();
  }));
});

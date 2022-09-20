/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { TipoDevolucionService } from './TipoDevolucion.service';

describe('Service: TipoDevolucion', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TipoDevolucionService]
    });
  });

  it('should ...', inject([TipoDevolucionService], (service: TipoDevolucionService) => {
    expect(service).toBeTruthy();
  }));
});

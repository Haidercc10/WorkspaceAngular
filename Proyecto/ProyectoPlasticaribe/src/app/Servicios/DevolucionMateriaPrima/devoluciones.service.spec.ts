/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { DevolucionesService } from './devoluciones.service';

describe('Service: Devoluciones', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DevolucionesService]
    });
  });

  it('should ...', inject([DevolucionesService], (service: DevolucionesService) => {
    expect(service).toBeTruthy();
  }));
});

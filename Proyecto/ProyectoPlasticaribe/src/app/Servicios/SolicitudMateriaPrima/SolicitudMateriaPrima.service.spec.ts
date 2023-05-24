/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { SolicitudMateriaPrimaService } from './SolicitudMateriaPrima.service';

describe('Service: SolicitudMateriaPrima', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SolicitudMateriaPrimaService]
    });
  });

  it('should ...', inject([SolicitudMateriaPrimaService], (service: SolicitudMateriaPrimaService) => {
    expect(service).toBeTruthy();
  }));
});

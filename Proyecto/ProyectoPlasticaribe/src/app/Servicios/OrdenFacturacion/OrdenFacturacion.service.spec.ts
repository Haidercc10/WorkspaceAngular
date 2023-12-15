/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { OrdenFacturacionService } from './OrdenFacturacion.service';

describe('Service: OrdenFacturacion', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [OrdenFacturacionService]
    });
  });

  it('should ...', inject([OrdenFacturacionService], (service: OrdenFacturacionService) => {
    expect(service).toBeTruthy();
  }));
});

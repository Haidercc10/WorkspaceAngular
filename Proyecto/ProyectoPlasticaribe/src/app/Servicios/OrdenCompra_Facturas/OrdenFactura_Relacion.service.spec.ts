/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { OrdenFactura_RelacionService } from './OrdenFactura_Relacion.service';

describe('Service: OrdenFactura_Relacion', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [OrdenFactura_RelacionService]
    });
  });

  it('should ...', inject([OrdenFactura_RelacionService], (service: OrdenFactura_RelacionService) => {
    expect(service).toBeTruthy();
  }));
});

/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { OrdenMaquila_FacturacionService } from './OrdenMaquila_Facturacion.service';

describe('Service: OrdenMaquila_Facturacion', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [OrdenMaquila_FacturacionService]
    });
  });

  it('should ...', inject([OrdenMaquila_FacturacionService], (service: OrdenMaquila_FacturacionService) => {
    expect(service).toBeTruthy();
  }));
});

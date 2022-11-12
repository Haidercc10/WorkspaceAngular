/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { OrdenCompra_MateriaPrimaService } from './OrdenCompra_MateriaPrima.service';

describe('Service: OrdenCompra_MateriaPrima', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [OrdenCompra_MateriaPrimaService]
    });
  });

  it('should ...', inject([OrdenCompra_MateriaPrimaService], (service: OrdenCompra_MateriaPrimaService) => {
    expect(service).toBeTruthy();
  }));
});

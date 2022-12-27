/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { OrdenCompra_RemisionService } from './OrdenCompra_Remision.service';

describe('Service: OrdenCompra_Remision', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [OrdenCompra_RemisionService]
    });
  });

  it('should ...', inject([OrdenCompra_RemisionService], (service: OrdenCompra_RemisionService) => {
    expect(service).toBeTruthy();
  }));
});

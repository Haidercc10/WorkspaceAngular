/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { ClientesProductosService } from './ClientesProductos.service';

describe('Service: ClientesProductos', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ClientesProductosService]
    });
  });

  it('should ...', inject([ClientesProductosService], (service: ClientesProductosService) => {
    expect(service).toBeTruthy();
  }));
});

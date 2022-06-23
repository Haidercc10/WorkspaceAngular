/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { PigmentoProductoService } from './pigmentoProducto.service';

describe('Service: PigmentoProducto', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PigmentoProductoService]
    });
  });

  it('should ...', inject([PigmentoProductoService], (service: PigmentoProductoService) => {
    expect(service).toBeTruthy();
  }));
});

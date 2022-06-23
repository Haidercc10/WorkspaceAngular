/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { MaterialProductoService } from './materialProducto.service';

describe('Service: MaterialProducto', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MaterialProductoService]
    });
  });

  it('should ...', inject([MaterialProductoService], (service: MaterialProductoService) => {
    expect(service).toBeTruthy();
  }));
});

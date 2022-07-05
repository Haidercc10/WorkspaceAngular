/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { RemisionFacturaService } from './remisionFactura.service';

describe('Service: RemisionFactura', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RemisionFacturaService]
    });
  });

  it('should ...', inject([RemisionFacturaService], (service: RemisionFacturaService) => {
    expect(service).toBeTruthy();
  }));
});

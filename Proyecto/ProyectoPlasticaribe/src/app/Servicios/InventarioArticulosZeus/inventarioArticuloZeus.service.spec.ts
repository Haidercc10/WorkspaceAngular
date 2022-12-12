/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { InventarioArticuloZeusService } from './inventarioArticuloZeus.service';

describe('Service: InventarioArticuloZeus', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [InventarioArticuloZeusService]
    });
  });

  it('should ...', inject([InventarioArticuloZeusService], (service: InventarioArticuloZeusService) => {
    expect(service).toBeTruthy();
  }));
});

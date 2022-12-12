/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { FactuaMpCompradaService } from './facturaMpComprada.service';

describe('Service: FactuaMpComprada', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FactuaMpCompradaService]
    });
  });

  it('should ...', inject([FactuaMpCompradaService], (service: FactuaMpCompradaService) => {
    expect(service).toBeTruthy();
  }));
});

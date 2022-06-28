/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { FacturaMpService } from './facturaMp.service';

describe('Service: FacturaMp', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FacturaMpService]
    });
  });

  it('should ...', inject([FacturaMpService], (service: FacturaMpService) => {
    expect(service).toBeTruthy();
  }));
});

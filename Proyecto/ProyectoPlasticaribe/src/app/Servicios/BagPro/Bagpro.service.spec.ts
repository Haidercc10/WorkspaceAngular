/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { BagproService } from './Bagpro.service';

describe('Service: BagproClientesOTItem', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BagproService]
    });
  });

  it('should ...', inject([BagproService], (service: BagproService) => {
    expect(service).toBeTruthy();
  }));
});

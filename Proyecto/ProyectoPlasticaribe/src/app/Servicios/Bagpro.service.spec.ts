/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { BagproClientesOTItemService } from './Bagpro.service';

describe('Service: BagproClientesOTItem', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BagproClientesOTItemService]
    });
  });

  it('should ...', inject([BagproClientesOTItemService], (service: BagproClientesOTItemService) => {
    expect(service).toBeTruthy();
  }));
});

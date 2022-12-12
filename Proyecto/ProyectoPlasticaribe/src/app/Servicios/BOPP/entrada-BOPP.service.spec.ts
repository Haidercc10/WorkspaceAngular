/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { EntradaBOPPService } from './entrada-BOPP.service';

describe('Service: EntradaBOPP', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EntradaBOPPService]
    });
  });

  it('should ...', inject([EntradaBOPPService], (service: EntradaBOPPService) => {
    expect(service).toBeTruthy();
  }));
});

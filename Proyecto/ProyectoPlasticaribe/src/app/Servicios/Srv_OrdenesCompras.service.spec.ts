/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { Srv_OrdenesComprasService } from './Srv_OrdenesCompras.service';

describe('Service: Srv_OrdenesCompras', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [Srv_OrdenesComprasService]
    });
  });

  it('should ...', inject([Srv_OrdenesComprasService], (service: Srv_OrdenesComprasService) => {
    expect(service).toBeTruthy();
  }));
});

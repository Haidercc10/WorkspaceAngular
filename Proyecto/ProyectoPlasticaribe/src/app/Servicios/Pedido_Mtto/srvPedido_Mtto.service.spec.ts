/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { SrvPedido_MttoService } from './srvPedido_Mtto.service';

describe('Service: SrvPedido_Mtto', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SrvPedido_MttoService]
    });
  });

  it('should ...', inject([SrvPedido_MttoService], (service: SrvPedido_MttoService) => {
    expect(service).toBeTruthy();
  }));
});

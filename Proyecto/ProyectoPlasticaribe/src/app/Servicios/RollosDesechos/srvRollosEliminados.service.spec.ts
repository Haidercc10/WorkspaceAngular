/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { SrvRollosEliminadosService } from './srvRollosEliminados.service';

describe('Service: SrvRollosEliminados', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SrvRollosEliminadosService]
    });
  });

  it('should ...', inject([SrvRollosEliminadosService], (service: SrvRollosEliminadosService) => {
    expect(service).toBeTruthy();
  }));
});

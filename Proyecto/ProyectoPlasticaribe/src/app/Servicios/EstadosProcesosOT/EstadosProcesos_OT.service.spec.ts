/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { EstadosProcesos_OTService } from './EstadosProcesos_OT.service';

describe('Service: EstadosProcesos_OT', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EstadosProcesos_OTService]
    });
  });

  it('should ...', inject([EstadosProcesos_OTService], (service: EstadosProcesos_OTService) => {
    expect(service).toBeTruthy();
  }));
});

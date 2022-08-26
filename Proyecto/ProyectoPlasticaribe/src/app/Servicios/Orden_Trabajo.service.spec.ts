/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { Orden_TrabajoService } from './Orden_Trabajo.service';

describe('Service: Orden_Trabajo', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [Orden_TrabajoService]
    });
  });

  it('should ...', inject([Orden_TrabajoService], (service: Orden_TrabajoService) => {
    expect(service).toBeTruthy();
  }));
});

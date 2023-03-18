/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { Orden_MaquilaService } from './Orden_Maquila.service';

describe('Service: Orden_Maquila', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [Orden_MaquilaService]
    });
  });

  it('should ...', inject([Orden_MaquilaService], (service: Orden_MaquilaService) => {
    expect(service).toBeTruthy();
  }));
});

/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { Movimientos_Entradas_MPService } from './Movimientos_Entradas_MP.service';

describe('Service: Movimientos_Entradas_MP', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [Movimientos_Entradas_MPService]
    });
  });

  it('should ...', inject([Movimientos_Entradas_MPService], (service: Movimientos_Entradas_MPService) => {
    expect(service).toBeTruthy();
  }));
});

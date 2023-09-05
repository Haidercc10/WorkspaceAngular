/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { Entradas_Salidas_MPService } from './Entradas_Salidas_MP.service';

describe('Service: Entradas_Salidas_MP', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [Entradas_Salidas_MPService]
    });
  });

  it('should ...', inject([Entradas_Salidas_MPService], (service: Entradas_Salidas_MPService) => {
    expect(service).toBeTruthy();
  }));
});

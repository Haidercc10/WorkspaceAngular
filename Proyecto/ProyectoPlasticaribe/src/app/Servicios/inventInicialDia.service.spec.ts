/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { InventInicialDiaService } from './inventInicialDia.service';

describe('Service: InventInicialDia', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [InventInicialDiaService]
    });
  });

  it('should ...', inject([InventInicialDiaService], (service: InventInicialDiaService) => {
    expect(service).toBeTruthy();
  }));
});

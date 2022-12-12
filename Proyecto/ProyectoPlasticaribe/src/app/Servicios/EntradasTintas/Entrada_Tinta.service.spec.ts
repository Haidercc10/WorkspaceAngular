/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { Entrada_TintaService } from './Entrada_Tinta.service';

describe('Service: Entrada_Tinta', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [Entrada_TintaService]
    });
  });

  it('should ...', inject([Entrada_TintaService], (service: Entrada_TintaService) => {
    expect(service).toBeTruthy();
  }));
});

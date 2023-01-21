/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { TiposSelladoService } from './TiposSellado.service';

describe('Service: TiposSellado', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TiposSelladoService]
    });
  });

  it('should ...', inject([TiposSelladoService], (service: TiposSelladoService) => {
    expect(service).toBeTruthy();
  }));
});

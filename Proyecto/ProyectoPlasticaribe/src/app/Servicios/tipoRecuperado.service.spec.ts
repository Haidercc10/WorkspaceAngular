/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { TipoRecuperadoService } from './tipoRecuperado.service';

describe('Service: TipoRecuperado', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TipoRecuperadoService]
    });
  });

  it('should ...', inject([TipoRecuperadoService], (service: TipoRecuperadoService) => {
    expect(service).toBeTruthy();
  }));
});

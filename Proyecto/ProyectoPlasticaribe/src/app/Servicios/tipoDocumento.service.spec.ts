/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { TipoDocumentoService } from './tipoDocumento.service';

describe('Service: TipoDocumento', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TipoDocumentoService]
    });
  });

  it('should ...', inject([TipoDocumentoService], (service: TipoDocumentoService) => {
    expect(service).toBeTruthy();
  }));
});

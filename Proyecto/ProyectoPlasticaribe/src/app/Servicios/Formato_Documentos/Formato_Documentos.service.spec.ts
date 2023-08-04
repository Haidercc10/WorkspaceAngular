/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { Formato_DocumentosService } from './Formato_Documentos.service';

describe('Service: Formato_Documentos', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [Formato_DocumentosService]
    });
  });

  it('should ...', inject([Formato_DocumentosService], (service: Formato_DocumentosService) => {
    expect(service).toBeTruthy();
  }));
});

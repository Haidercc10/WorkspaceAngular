/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { RecuperadoService } from './recuperado.service';

describe('Service: Recuperado', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RecuperadoService]
    });
  });

  it('should ...', inject([RecuperadoService], (service: RecuperadoService) => {
    expect(service).toBeTruthy();
  }));
});

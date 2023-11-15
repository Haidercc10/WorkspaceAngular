/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { DepartamentosMunicipiosColombiaService } from './DepartamentosMunicipiosColombia.service';

describe('Service: DepartamentosMunicipiosColombia', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DepartamentosMunicipiosColombiaService]
    });
  });

  it('should ...', inject([DepartamentosMunicipiosColombiaService], (service: DepartamentosMunicipiosColombiaService) => {
    expect(service).toBeTruthy();
  }));
});

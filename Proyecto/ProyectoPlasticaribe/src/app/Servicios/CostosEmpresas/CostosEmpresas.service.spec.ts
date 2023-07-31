/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { CostosEmpresasService } from './CostosEmpresas.service';

describe('Service: CostosEmpresas', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CostosEmpresasService]
    });
  });

  it('should ...', inject([CostosEmpresasService], (service: CostosEmpresasService) => {
    expect(service).toBeTruthy();
  }));
});

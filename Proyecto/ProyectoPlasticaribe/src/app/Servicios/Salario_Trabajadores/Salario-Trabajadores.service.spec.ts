/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { SalarioTrabajadoresService } from './Salario-Trabajadores.service';

describe('Service: SalarioTrabajadores', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SalarioTrabajadoresService]
    });
  });

  it('should ...', inject([SalarioTrabajadoresService], (service: SalarioTrabajadoresService) => {
    expect(service).toBeTruthy();
  }));
});

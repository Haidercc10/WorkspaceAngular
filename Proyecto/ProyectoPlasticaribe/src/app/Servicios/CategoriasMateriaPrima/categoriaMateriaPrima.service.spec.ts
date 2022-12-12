/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { CategoriaMateriaPrimaService } from './categoriaMateriaPrima.service';

describe('Service: CategoriaMateriaPrima', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CategoriaMateriaPrimaService]
    });
  });

  it('should ...', inject([CategoriaMateriaPrimaService], (service: CategoriaMateriaPrimaService) => {
    expect(service).toBeTruthy();
  }));
});

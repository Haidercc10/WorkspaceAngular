import { TestBed } from '@angular/core/testing';

import { SubcategoriasMatPrimaService } from './subcategorias-mat-prima.service';

describe('SubcategoriasMatPrimaService', () => {
  let service: SubcategoriasMatPrimaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SubcategoriasMatPrimaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

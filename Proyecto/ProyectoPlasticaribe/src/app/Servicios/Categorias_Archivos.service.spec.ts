/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { Categorias_ArchivosService } from './Categorias_Archivos.service';

describe('Service: Categorias_Archivos', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [Categorias_ArchivosService]
    });
  });

  it('should ...', inject([Categorias_ArchivosService], (service: Categorias_ArchivosService) => {
    expect(service).toBeTruthy();
  }));
});

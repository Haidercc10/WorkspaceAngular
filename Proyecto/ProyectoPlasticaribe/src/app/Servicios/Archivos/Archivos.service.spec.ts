/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { ArchivosService } from '../Archivos.service';

describe('Service: Archivos', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ArchivosService]
    });
  });

  it('should ...', inject([ArchivosService], (service: ArchivosService) => {
    expect(service).toBeTruthy();
  }));
});

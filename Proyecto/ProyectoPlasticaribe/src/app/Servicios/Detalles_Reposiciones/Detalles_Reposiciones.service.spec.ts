/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { Detalles_ReposicionesService } from '../Detalles_Reposiciones/Detalles_Reposiciones.service';

describe('Service: Detalles_Reposiciones', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [Detalles_ReposicionesService]
    });
  });

  it('should ...', inject([Detalles_ReposicionesService], (service: Detalles_ReposicionesService) => {
    expect(service).toBeTruthy();
  }));
});

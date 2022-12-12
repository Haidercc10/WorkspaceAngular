/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { Mezclas_MaterialesService } from './Mezclas_Materiales.service';

describe('Service: Mezclas_Materiales', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [Mezclas_MaterialesService]
    });
  });

  it('should ...', inject([Mezclas_MaterialesService], (service: Mezclas_MaterialesService) => {
    expect(service).toBeTruthy();
  }));
});

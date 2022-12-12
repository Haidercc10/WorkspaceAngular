/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { Mezclas_PigmentosService } from './Mezclas_Pigmentos.service';

describe('Service: Mezclas_Pigmentos', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [Mezclas_PigmentosService]
    });
  });

  it('should ...', inject([Mezclas_PigmentosService], (service: Mezclas_PigmentosService) => {
    expect(service).toBeTruthy();
  }));
});

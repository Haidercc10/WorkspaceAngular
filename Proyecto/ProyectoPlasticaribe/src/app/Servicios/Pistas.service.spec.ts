/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { PistasService } from './Pistas.service';

describe('Service: Pistas', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PistasService]
    });
  });

  it('should ...', inject([PistasService], (service: PistasService) => {
    expect(service).toBeTruthy();
  }));
});

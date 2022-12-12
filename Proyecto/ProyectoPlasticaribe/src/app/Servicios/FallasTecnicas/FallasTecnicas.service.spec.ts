/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { FallasTecnicasService } from './FallasTecnicas.service';

describe('Service: FallasTecnicas', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FallasTecnicasService]
    });
  });

  it('should ...', inject([FallasTecnicasService], (service: FallasTecnicasService) => {
    expect(service).toBeTruthy();
  }));
});

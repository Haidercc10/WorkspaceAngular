/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { TpFallasTecnicasService } from './TpFallasTecnicas.service';

describe('Service: TpFallasTecnicas', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TpFallasTecnicasService]
    });
  });

  it('should ...', inject([TpFallasTecnicasService], (service: TpFallasTecnicasService) => {
    expect(service).toBeTruthy();
  }));
});

/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { TintasService } from './tintas.service';

describe('Service: Tintas', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TintasService]
    });
  });

  it('should ...', inject([TintasService], (service: TintasService) => {
    expect(service).toBeTruthy();
  }));
});

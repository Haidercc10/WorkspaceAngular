/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { TipoBodegaService } from './tipoBodega.service';

describe('Service: TipoBodega', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TipoBodegaService]
    });
  });

  it('should ...', inject([TipoBodegaService], (service: TipoBodegaService) => {
    expect(service).toBeTruthy();
  }));
});

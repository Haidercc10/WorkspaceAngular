/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { FestivosService } from './Festivos.service';

describe('Service: Festivos', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FestivosService]
    });
  });

  it('should ...', inject([FestivosService], (service: FestivosService) => {
    expect(service).toBeTruthy();
  }));
});

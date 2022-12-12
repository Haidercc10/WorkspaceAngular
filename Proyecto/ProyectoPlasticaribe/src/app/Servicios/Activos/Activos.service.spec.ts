/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { ActivosService } from './Activos.service';

describe('Service: Activos', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ActivosService]
    });
  });

  it('should ...', inject([ActivosService], (service: ActivosService) => {
    expect(service).toBeTruthy();
  }));
});

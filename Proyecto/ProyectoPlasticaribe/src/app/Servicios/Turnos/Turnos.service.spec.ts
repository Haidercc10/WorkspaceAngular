/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { TurnosService } from './Turnos.service';

describe('Service: Turnos', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TurnosService]
    });
  });

  it('should ...', inject([TurnosService], (service: TurnosService) => {
    expect(service).toBeTruthy();
  }));
});

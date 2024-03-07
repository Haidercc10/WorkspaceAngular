/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { IncapacidadesService } from './Incapacidades.service';

describe('Service: Incapacidades', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [IncapacidadesService]
    });
  });

  it('should ...', inject([IncapacidadesService], (service: IncapacidadesService) => {
    expect(service).toBeTruthy();
  }));
});

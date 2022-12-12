/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { DevolucionesMPService } from './devolucionesMP.service';

describe('Service: DevolucionesMP', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DevolucionesMPService]
    });
  });

  it('should ...', inject([DevolucionesMPService], (service: DevolucionesMPService) => {
    expect(service).toBeTruthy();
  }));
});

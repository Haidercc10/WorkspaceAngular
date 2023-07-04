/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { SolicitudMP_ExtrusionService } from './SolicitudMP_Extrusion.service';

describe('Service: SolicitudMP_Extrusion', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SolicitudMP_ExtrusionService]
    });
  });

  it('should ...', inject([SolicitudMP_ExtrusionService], (service: SolicitudMP_ExtrusionService) => {
    expect(service).toBeTruthy();
  }));
});

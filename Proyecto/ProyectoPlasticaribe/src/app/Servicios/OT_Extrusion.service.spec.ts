/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { OT_ExtrusionService } from './OT_Extrusion.service';

describe('Service: OT_Extrusion', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [OT_ExtrusionService]
    });
  });

  it('should ...', inject([OT_ExtrusionService], (service: OT_ExtrusionService) => {
    expect(service).toBeTruthy();
  }));
});

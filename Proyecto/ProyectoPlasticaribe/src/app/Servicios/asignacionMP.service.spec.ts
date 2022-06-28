/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { AsignacionMPService } from './asignacionMP.service';

describe('Service: AsignacionMP', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AsignacionMPService]
    });
  });

  it('should ...', inject([AsignacionMPService], (service: AsignacionMPService) => {
    expect(service).toBeTruthy();
  }));
});

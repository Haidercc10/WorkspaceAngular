/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { Tickets_ResueltosService } from './Tickets_Resueltos.service';

describe('Service: Tickets_Resueltos', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [Tickets_ResueltosService]
    });
  });

  it('should ...', inject([Tickets_ResueltosService], (service: Tickets_ResueltosService) => {
    expect(service).toBeTruthy();
  }));
});

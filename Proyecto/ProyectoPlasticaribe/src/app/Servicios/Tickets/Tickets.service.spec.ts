/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { TicketsService } from './Tickets.service';

describe('Service: Tickets', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TicketsService]
    });
  });

  it('should ...', inject([TicketsService], (service: TicketsService) => {
    expect(service).toBeTruthy();
  }));
});

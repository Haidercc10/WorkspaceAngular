/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { EventosCalendarioService } from './EventosCalendario.service';

describe('Service: EventosCalendario', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EventosCalendarioService]
    });
  });

  it('should ...', inject([EventosCalendarioService], (service: EventosCalendarioService) => {
    expect(service).toBeTruthy();
  }));
});

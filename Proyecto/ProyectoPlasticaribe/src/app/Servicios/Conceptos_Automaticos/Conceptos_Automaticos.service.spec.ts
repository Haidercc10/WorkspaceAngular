/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { Conceptos_AutomaticosService } from './Conceptos_Automaticos.service';

describe('Service: Conceptos_Automaticos', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [Conceptos_AutomaticosService]
    });
  });

  it('should ...', inject([Conceptos_AutomaticosService], (service: Conceptos_AutomaticosService) => {
    expect(service).toBeTruthy();
  }));
});

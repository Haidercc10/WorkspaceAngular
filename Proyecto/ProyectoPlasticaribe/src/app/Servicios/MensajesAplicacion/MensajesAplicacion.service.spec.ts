/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { MensajesAplicacionService } from './MensajesAplicacion.service';

describe('Service: MensajesAplicacion', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MensajesAplicacionService]
    });
  });

  it('should ...', inject([MensajesAplicacionService], (service: MensajesAplicacionService) => {
    expect(service).toBeTruthy();
  }));
});

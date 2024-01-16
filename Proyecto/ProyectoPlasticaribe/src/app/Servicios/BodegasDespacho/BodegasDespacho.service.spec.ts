/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { BodegasDespachoService } from './BodegasDespacho.service';

describe('Service: BodegasDespacho', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BodegasDespachoService]
    });
  });

  it('should ...', inject([BodegasDespachoService], (service: BodegasDespachoService) => {
    expect(service).toBeTruthy();
  }));
});

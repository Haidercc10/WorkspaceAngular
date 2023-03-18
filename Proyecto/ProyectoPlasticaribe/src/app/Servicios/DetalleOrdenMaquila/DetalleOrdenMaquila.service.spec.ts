/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { DetalleOrdenMaquilaService } from './DetalleOrdenMaquila.service';

describe('Service: DetalleOrdenMaquila', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DetalleOrdenMaquilaService]
    });
  });

  it('should ...', inject([DetalleOrdenMaquilaService], (service: DetalleOrdenMaquilaService) => {
    expect(service).toBeTruthy();
  }));
});

/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { EncriptacionService } from './Encriptacion.service';

describe('Service: Encriptacion', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EncriptacionService]
    });
  });

  it('should ...', inject([EncriptacionService], (service: EncriptacionService) => {
    expect(service).toBeTruthy();
  }));
});

/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { RecuperadoMPService } from './recuperadoMP.service';

describe('Service: RecuperadoMP', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RecuperadoMPService]
    });
  });

  it('should ...', inject([RecuperadoMPService], (service: RecuperadoMPService) => {
    expect(service).toBeTruthy();
  }));
});

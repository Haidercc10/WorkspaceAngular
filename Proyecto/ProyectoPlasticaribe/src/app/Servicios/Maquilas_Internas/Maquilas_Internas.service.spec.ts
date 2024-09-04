/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { Maquilas_InternasService } from './Maquilas_Internas.service';

describe('Service: Maquilas_Internas', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [Maquilas_InternasService]
    });
  });

  it('should ...', inject([Maquilas_InternasService], (service: Maquilas_InternasService) => {
    expect(service).toBeTruthy();
  }));
});

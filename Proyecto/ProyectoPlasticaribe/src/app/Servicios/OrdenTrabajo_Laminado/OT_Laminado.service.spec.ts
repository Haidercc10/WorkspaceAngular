/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { OT_LaminadoService } from './OT_Laminado.service';

describe('Service: OT_Laminado', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [OT_LaminadoService]
    });
  });

  it('should ...', inject([OT_LaminadoService], (service: OT_LaminadoService) => {
    expect(service).toBeTruthy();
  }));
});

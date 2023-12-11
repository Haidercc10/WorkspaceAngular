/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { Tipos_ConceptosService } from './Tipos_Conceptos.service';

describe('Service: Tipos_Conceptos', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [Tipos_ConceptosService]
    });
  });

  it('should ...', inject([Tipos_ConceptosService], (service: Tipos_ConceptosService) => {
    expect(service).toBeTruthy();
  }));
});

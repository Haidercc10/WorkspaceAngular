/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { FormatosService } from './Formatos.service';

describe('Service: Formatos', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FormatosService]
    });
  });

  it('should ...', inject([FormatosService], (service: FormatosService) => {
    expect(service).toBeTruthy();
  }));
});

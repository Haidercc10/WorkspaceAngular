/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { CreacionPdfService } from './creacion-pdf.service';

describe('Service: CreacionPdf', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CreacionPdfService]
    });
  });

  it('should ...', inject([CreacionPdfService], (service: CreacionPdfService) => {
    expect(service).toBeTruthy();
  }));
});

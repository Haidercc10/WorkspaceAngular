/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { CreacionExcelService } from './CreacionExcel.service';

describe('Service: CreacionExcel', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CreacionExcelService]
    });
  });

  it('should ...', inject([CreacionExcelService], (service: CreacionExcelService) => {
    expect(service).toBeTruthy();
  }));
});

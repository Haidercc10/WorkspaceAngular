/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { MateriaPrimaService } from './materiaPrima.service';

describe('Service: MateriaPrima', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MateriaPrimaService]
    });
  });

  it('should ...', inject([MateriaPrimaService], (service: MateriaPrimaService) => {
    expect(service).toBeTruthy();
  }));
});

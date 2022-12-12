/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { MezclasService } from './Mezclas.service';

describe('Service: Mezclas', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MezclasService]
    });
  });

  it('should ...', inject([MezclasService], (service: MezclasService) => {
    expect(service).toBeTruthy();
  }));
});

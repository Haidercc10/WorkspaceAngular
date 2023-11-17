/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { ConosService } from './conos.service';

describe('Service: Conos', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ConosService]
    });
  });

  it('should ...', inject([ConosService], (service: ConosService) => {
    expect(service).toBeTruthy();
  }));
});

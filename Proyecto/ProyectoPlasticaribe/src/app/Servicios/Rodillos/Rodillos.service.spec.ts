/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { RodillosService } from './Rodillos.service';

describe('Service: Rodillos', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RodillosService]
    });
  });

  it('should ...', inject([RodillosService], (service: RodillosService) => {
    expect(service).toBeTruthy();
  }));
});

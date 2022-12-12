/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { RemisionService } from './Remision.service';

describe('Service: Remision', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RemisionService]
    });
  });

  it('should ...', inject([RemisionService], (service: RemisionService) => {
    expect(service).toBeTruthy();
  }));
});

/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { RemisionesMPService } from './remisionesMP.service';

describe('Service: RemisionesMP', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RemisionesMPService]
    });
  });

  it('should ...', inject([RemisionesMPService], (service: RemisionesMPService) => {
    expect(service).toBeTruthy();
  }));
});

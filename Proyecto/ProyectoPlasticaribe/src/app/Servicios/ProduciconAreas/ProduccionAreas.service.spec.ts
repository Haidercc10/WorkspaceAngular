/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { ProduccionAreasService } from './ProduccionAreas.service';

describe('Service: ProduccionAreas', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ProduccionAreasService]
    });
  });

  it('should ...', inject([ProduccionAreasService], (service: ProduccionAreasService) => {
    expect(service).toBeTruthy();
  }));
});

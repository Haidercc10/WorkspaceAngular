/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { AreaService } from './area.service';

describe('Service: Area', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AreaService]
    });
  });

  it('should ...', inject([AreaService], (service: AreaService) => {
    expect(service).toBeTruthy();
  }));
});

import { TestBed } from '@angular/core/testing';

import { EpsService } from './eps.service';

describe('EpsService', () => {
  let service: EpsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EpsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

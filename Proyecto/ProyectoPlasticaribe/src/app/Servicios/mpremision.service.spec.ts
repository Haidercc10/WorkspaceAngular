import { TestBed } from '@angular/core/testing';

import { MpremisionService } from './mpremision.service';

describe('MpremisionService', () => {
  let service: MpremisionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MpremisionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

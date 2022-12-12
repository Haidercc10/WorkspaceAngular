import { TestBed } from '@angular/core/testing';

import { FpensionService } from './fpension.service';

describe('FpensionService', () => {
  let service: FpensionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FpensionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

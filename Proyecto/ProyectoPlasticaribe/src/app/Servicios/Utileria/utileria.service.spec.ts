import { TestBed } from '@angular/core/testing';

import { UtileriaService } from './utileria.service';

describe('UtileriaService', () => {
  let service: UtileriaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UtileriaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

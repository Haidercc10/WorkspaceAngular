import { TestBed } from '@angular/core/testing';

import { DesperdicioService } from './desperdicio.service';

describe('DesperdicioService', () => {
  let service: DesperdicioService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DesperdicioService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

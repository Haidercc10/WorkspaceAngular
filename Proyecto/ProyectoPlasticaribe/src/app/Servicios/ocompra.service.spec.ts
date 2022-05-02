import { TestBed } from '@angular/core/testing';

import { OcompraService } from './ocompra.service';

describe('OcompraService', () => {
  let service: OcompraService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OcompraService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

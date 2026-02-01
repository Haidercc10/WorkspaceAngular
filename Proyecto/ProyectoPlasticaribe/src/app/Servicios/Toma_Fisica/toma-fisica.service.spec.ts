import { TestBed } from '@angular/core/testing';

import { TomaFisicaService } from './toma-fisica.service';

describe('TomaFisicaService', () => {
  let service: TomaFisicaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TomaFisicaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

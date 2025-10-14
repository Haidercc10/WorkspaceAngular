import { TestBed } from '@angular/core/testing';

import { ProduccionDiariaService } from './produccion-diaria.service';

describe('ProduccionDiariaService', () => {
  let service: ProduccionDiariaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProduccionDiariaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

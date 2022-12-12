import { TestBed } from '@angular/core/testing';

import { SedeClienteService } from './sede-cliente.service';

describe('SedeClienteService', () => {
  let service: SedeClienteService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SedeClienteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

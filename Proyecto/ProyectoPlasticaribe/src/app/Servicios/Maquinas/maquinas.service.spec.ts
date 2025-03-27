import { TestBed } from '@angular/core/testing';

import { MaquinasService } from './maquinas.service';

describe('MaquinasService', () => {
  let service: MaquinasService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MaquinasService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

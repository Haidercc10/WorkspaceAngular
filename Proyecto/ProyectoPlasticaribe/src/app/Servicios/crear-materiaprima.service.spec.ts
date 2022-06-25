import { TestBed } from '@angular/core/testing';

import { CrearMateriaprimaService } from './crear-materiaprima.service';

describe('CrearMateriaprimaService', () => {
  let service: CrearMateriaprimaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CrearMateriaprimaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';

import { ServicioAreasService } from './servicio-areas.service';

describe('ServicioAreasService', () => {
  let service: ServicioAreasService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ServicioAreasService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

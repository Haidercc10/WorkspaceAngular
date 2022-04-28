import { TestBed } from '@angular/core/testing';

import { ServicioRegistroService } from './servicio-registro.service';

describe('ServicioRegistroService', () => {
  let service: ServicioRegistroService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ServicioRegistroService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

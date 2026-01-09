import { TestBed } from '@angular/core/testing';

import { ColoresBarraProgresoService } from './colores-barra-progreso.service';

describe('ColoresBarraProgresoService', () => {
  let service: ColoresBarraProgresoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ColoresBarraProgresoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

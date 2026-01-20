import { TestBed } from '@angular/core/testing';

import { TomaFisicaInventarioService } from './toma-fisica-inventario.service';

describe('TomaFisicaInventarioService', () => {
  let service: TomaFisicaInventarioService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TomaFisicaInventarioService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

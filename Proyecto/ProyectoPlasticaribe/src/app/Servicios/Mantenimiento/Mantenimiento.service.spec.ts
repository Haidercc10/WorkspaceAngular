/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { MantenimientoService } from './Mantenimiento.service';

describe('Service: Mantenimiento', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MantenimientoService]
    });
  });

  it('should ...', inject([MantenimientoService], (service: MantenimientoService) => {
    expect(service).toBeTruthy();
  }));
});

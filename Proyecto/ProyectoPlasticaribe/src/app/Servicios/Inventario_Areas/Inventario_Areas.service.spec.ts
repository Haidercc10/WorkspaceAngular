/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { Inventario_AreasService } from './Inventario_Areas.service';

describe('Service: Inventario_Areas', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [Inventario_AreasService]
    });
  });

  it('should ...', inject([Inventario_AreasService], (service: Inventario_AreasService) => {
    expect(service).toBeTruthy();
  }));
});

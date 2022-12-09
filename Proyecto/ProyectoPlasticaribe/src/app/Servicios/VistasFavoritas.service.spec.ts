/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { VistasFavoritasService } from './VistasFavoritas.service';

describe('Service: VistasFavoritas', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [VistasFavoritasService]
    });
  });

  it('should ...', inject([VistasFavoritasService], (service: VistasFavoritasService) => {
    expect(service).toBeTruthy();
  }));
});

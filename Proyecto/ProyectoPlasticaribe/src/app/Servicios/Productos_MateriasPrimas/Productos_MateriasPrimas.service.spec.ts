/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { Productos_MateriasPrimasService } from './Productos_MateriasPrimas.service';

describe('Service: Productos_MateriasPrimas', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [Productos_MateriasPrimasService]
    });
  });

  it('should ...', inject([Productos_MateriasPrimasService], (service: Productos_MateriasPrimasService) => {
    expect(service).toBeTruthy();
  }));
});

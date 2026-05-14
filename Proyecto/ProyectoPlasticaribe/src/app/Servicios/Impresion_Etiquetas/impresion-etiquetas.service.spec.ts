import { TestBed } from '@angular/core/testing';

import { ImpresionEtiquetasService } from './impresion-etiquetas.service';

describe('ImpresionEtiquetasService', () => {
  let service: ImpresionEtiquetasService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ImpresionEtiquetasService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { Inventario_Mes_ProductosService } from './Inventario_Mes_Productos.service';

describe('Service: Inventario_Mes_Productos', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [Inventario_Mes_ProductosService]
    });
  });

  it('should ...', inject([Inventario_Mes_ProductosService], (service: Inventario_Mes_ProductosService) => {
    expect(service).toBeTruthy();
  }));
});

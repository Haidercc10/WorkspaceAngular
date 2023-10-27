/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ReporteFacturacionDetalladaComponent } from './Reporte-Facturacion-Detallada.component';

describe('ReporteFacturacionDetalladaComponent', () => {
  let component: ReporteFacturacionDetalladaComponent;
  let fixture: ComponentFixture<ReporteFacturacionDetalladaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReporteFacturacionDetalladaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReporteFacturacionDetalladaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

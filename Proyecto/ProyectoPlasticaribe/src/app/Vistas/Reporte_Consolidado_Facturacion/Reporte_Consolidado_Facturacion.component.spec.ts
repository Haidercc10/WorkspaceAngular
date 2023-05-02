/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { Reporte_Consolidado_FacturacionComponent } from './Reporte_Consolidado_Facturacion.component';

describe('Reporte_Consolidado_FacturacionComponent', () => {
  let component: Reporte_Consolidado_FacturacionComponent;
  let fixture: ComponentFixture<Reporte_Consolidado_FacturacionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Reporte_Consolidado_FacturacionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Reporte_Consolidado_FacturacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

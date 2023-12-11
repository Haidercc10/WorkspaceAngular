/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { Reporte_EstadisticasVentasComponent } from './Reporte_EstadisticasVentas.component';

describe('Reporte_EstadisticasVentasComponent', () => {
  let component: Reporte_EstadisticasVentasComponent;
  let fixture: ComponentFixture<Reporte_EstadisticasVentasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Reporte_EstadisticasVentasComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Reporte_EstadisticasVentasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

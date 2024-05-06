/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { Facturacion_Vs_IngresosDespachoComponent } from './Facturacion_Vs_IngresosDespacho.component';

describe('Facturacion_Vs_IngresosDespachoComponent', () => {
  let component: Facturacion_Vs_IngresosDespachoComponent;
  let fixture: ComponentFixture<Facturacion_Vs_IngresosDespachoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Facturacion_Vs_IngresosDespachoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Facturacion_Vs_IngresosDespachoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { Formato_Facturas_VentasComponent } from './Formato_Facturas_Ventas.component';

describe('Formato_Facturas_VentasComponent', () => {
  let component: Formato_Facturas_VentasComponent;
  let fixture: ComponentFixture<Formato_Facturas_VentasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Formato_Facturas_VentasComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Formato_Facturas_VentasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

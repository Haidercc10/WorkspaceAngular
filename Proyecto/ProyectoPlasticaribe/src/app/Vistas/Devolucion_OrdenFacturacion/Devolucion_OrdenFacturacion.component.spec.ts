/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { Devolucion_OrdenFacturacionComponent } from './Devolucion_OrdenFacturacion.component';

describe('Devolucion_OrdenFacturacionComponent', () => {
  let component: Devolucion_OrdenFacturacionComponent;
  let fixture: ComponentFixture<Devolucion_OrdenFacturacionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Devolucion_OrdenFacturacionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Devolucion_OrdenFacturacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { MovimientosOrdenFacturacionComponent } from './Movimientos-OrdenFacturacion.component';

describe('MovimientosOrdenFacturacionComponent', () => {
  let component: MovimientosOrdenFacturacionComponent;
  let fixture: ComponentFixture<MovimientosOrdenFacturacionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MovimientosOrdenFacturacionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MovimientosOrdenFacturacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

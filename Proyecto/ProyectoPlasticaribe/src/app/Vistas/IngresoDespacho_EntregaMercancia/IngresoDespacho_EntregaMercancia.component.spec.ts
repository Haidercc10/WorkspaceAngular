/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { IngresoDespacho_EntregaMercanciaComponent } from './IngresoDespacho_EntregaMercancia.component';

describe('IngresoDespacho_EntregaMercanciaComponent', () => {
  let component: IngresoDespacho_EntregaMercanciaComponent;
  let fixture: ComponentFixture<IngresoDespacho_EntregaMercanciaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IngresoDespacho_EntregaMercanciaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IngresoDespacho_EntregaMercanciaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

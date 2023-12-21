/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { Movimientos_PreIngresoProduccionComponent } from './Movimientos_PreIngresoProduccion.component';

describe('Movimientos_PreIngresoProduccionComponent', () => {
  let component: Movimientos_PreIngresoProduccionComponent;
  let fixture: ComponentFixture<Movimientos_PreIngresoProduccionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Movimientos_PreIngresoProduccionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Movimientos_PreIngresoProduccionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

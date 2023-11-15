/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { Busqueda_OrdenesTrabajoComponent } from './Busqueda_OrdenesTrabajo.component';

describe('Busqueda_OrdenesTrabajoComponent', () => {
  let component: Busqueda_OrdenesTrabajoComponent;
  let fixture: ComponentFixture<Busqueda_OrdenesTrabajoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Busqueda_OrdenesTrabajoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Busqueda_OrdenesTrabajoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

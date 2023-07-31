/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { Ingreso_NominaComponent } from './Ingreso_Nomina.component';

describe('Ingreso_NominaComponent', () => {
  let component: Ingreso_NominaComponent;
  let fixture: ComponentFixture<Ingreso_NominaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Ingreso_NominaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Ingreso_NominaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

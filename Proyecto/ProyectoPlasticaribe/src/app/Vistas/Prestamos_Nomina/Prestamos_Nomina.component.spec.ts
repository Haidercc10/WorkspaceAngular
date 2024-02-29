/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { Prestamos_NominaComponent } from './Prestamos_Nomina.component';

describe('Prestamos_NominaComponent', () => {
  let component: Prestamos_NominaComponent;
  let fixture: ComponentFixture<Prestamos_NominaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Prestamos_NominaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Prestamos_NominaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

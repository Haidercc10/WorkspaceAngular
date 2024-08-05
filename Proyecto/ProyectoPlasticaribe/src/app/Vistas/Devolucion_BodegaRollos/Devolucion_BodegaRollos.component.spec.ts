/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { Devolucion_BodegaRollosComponent } from './Devolucion_BodegaRollos.component';

describe('Devolucion_BodegaRollosComponent', () => {
  let component: Devolucion_BodegaRollosComponent;
  let fixture: ComponentFixture<Devolucion_BodegaRollosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Devolucion_BodegaRollosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Devolucion_BodegaRollosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

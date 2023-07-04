/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { Movimientos_SolicitudRollosComponent } from './Movimientos_SolicitudRollos.component';

describe('Movimientos_SolicitudRollosComponent', () => {
  let component: Movimientos_SolicitudRollosComponent;
  let fixture: ComponentFixture<Movimientos_SolicitudRollosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Movimientos_SolicitudRollosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Movimientos_SolicitudRollosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

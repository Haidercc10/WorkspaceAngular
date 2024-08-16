/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { Asignacion_RollosOTComponent } from './Asignacion_RollosOT.component';

describe('Asignacion_RollosOTComponent', () => {
  let component: Asignacion_RollosOTComponent;
  let fixture: ComponentFixture<Asignacion_RollosOTComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Asignacion_RollosOTComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Asignacion_RollosOTComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

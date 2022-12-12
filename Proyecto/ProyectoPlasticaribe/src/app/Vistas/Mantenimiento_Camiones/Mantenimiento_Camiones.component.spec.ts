/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { Mantenimiento_CamionesComponent } from './Mantenimiento_Camiones.component';

describe('Mantenimiento_CamionesComponent', () => {
  let component: Mantenimiento_CamionesComponent;
  let fixture: ComponentFixture<Mantenimiento_CamionesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Mantenimiento_CamionesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Mantenimiento_CamionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

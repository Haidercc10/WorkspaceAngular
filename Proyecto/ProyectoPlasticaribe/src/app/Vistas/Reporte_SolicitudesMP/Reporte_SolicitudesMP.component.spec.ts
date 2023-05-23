/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { Reporte_SolicitudesMPComponent } from './Reporte_SolicitudesMP.component';

describe('Reporte_SolicitudesMPComponent', () => {
  let component: Reporte_SolicitudesMPComponent;
  let fixture: ComponentFixture<Reporte_SolicitudesMPComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Reporte_SolicitudesMPComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Reporte_SolicitudesMPComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

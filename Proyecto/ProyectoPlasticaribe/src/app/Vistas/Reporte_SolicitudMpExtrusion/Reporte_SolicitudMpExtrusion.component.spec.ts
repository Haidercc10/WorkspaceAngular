/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { Reporte_SolicitudMpExtrusionComponent } from './Reporte_SolicitudMpExtrusion.component';

describe('Reporte_SolicitudMpExtrusionComponent', () => {
  let component: Reporte_SolicitudMpExtrusionComponent;
  let fixture: ComponentFixture<Reporte_SolicitudMpExtrusionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Reporte_SolicitudMpExtrusionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Reporte_SolicitudMpExtrusionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

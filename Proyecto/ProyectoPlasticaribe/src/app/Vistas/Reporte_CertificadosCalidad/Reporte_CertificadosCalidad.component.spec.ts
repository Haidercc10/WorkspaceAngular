/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { Reporte_CertificadosCalidadComponent } from './Reporte_CertificadosCalidad.component';

describe('Reporte_CertificadosCalidadComponent', () => {
  let component: Reporte_CertificadosCalidadComponent;
  let fixture: ComponentFixture<Reporte_CertificadosCalidadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Reporte_CertificadosCalidadComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Reporte_CertificadosCalidadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

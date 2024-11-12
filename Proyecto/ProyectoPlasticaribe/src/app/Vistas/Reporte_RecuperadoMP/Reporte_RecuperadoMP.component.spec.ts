/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { Reporte_RecuperadoMPComponent } from './Reporte_RecuperadoMP.component';

describe('Reporte_RecuperadoMPComponent', () => {
  let component: Reporte_RecuperadoMPComponent;
  let fixture: ComponentFixture<Reporte_RecuperadoMPComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Reporte_RecuperadoMPComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Reporte_RecuperadoMPComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

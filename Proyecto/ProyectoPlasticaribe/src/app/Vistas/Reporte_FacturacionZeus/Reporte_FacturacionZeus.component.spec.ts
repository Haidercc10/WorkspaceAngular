/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { Reporte_FacturacionZeusComponent } from './Reporte_FacturacionZeus.component';

describe('Reporte_FacturacionZeusComponent', () => {
  let component: Reporte_FacturacionZeusComponent;
  let fixture: ComponentFixture<Reporte_FacturacionZeusComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Reporte_FacturacionZeusComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Reporte_FacturacionZeusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

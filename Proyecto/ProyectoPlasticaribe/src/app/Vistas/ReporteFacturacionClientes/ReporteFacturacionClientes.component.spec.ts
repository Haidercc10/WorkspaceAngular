/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ReporteFacturacionClientesComponent } from './ReporteFacturacionClientes.component';

describe('ReporteFacturacionClientesComponent', () => {
  let component: ReporteFacturacionClientesComponent;
  let fixture: ComponentFixture<ReporteFacturacionClientesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReporteFacturacionClientesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReporteFacturacionClientesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

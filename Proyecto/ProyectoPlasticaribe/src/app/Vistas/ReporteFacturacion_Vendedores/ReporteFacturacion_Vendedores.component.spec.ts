/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ReporteFacturacion_VendedoresComponent } from './ReporteFacturacion_Vendedores.component';

describe('ReporteFacturacion_VendedoresComponent', () => {
  let component: ReporteFacturacion_VendedoresComponent;
  let fixture: ComponentFixture<ReporteFacturacion_VendedoresComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReporteFacturacion_VendedoresComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReporteFacturacion_VendedoresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

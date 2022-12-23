/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ReporteInventarioMateriaPrimaComponent } from './ReporteInventarioMateriaPrima.component';

describe('ReporteInventarioMateriaPrimaComponent', () => {
  let component: ReporteInventarioMateriaPrimaComponent;
  let fixture: ComponentFixture<ReporteInventarioMateriaPrimaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReporteInventarioMateriaPrimaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReporteInventarioMateriaPrimaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

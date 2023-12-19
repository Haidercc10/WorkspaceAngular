/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { PreIngresoProduccion_DespachoComponent } from './PreIngresoProduccion_Despacho.component';

describe('PreIngresoProduccion_DespachoComponent', () => {
  let component: PreIngresoProduccion_DespachoComponent;
  let fixture: ComponentFixture<PreIngresoProduccion_DespachoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PreIngresoProduccion_DespachoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PreIngresoProduccion_DespachoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

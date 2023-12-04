/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { IngresoProduccion_DespachoComponent } from './IngresoProduccion_Despacho.component';

describe('IngresoProduccion_DespachoComponent', () => {
  let component: IngresoProduccion_DespachoComponent;
  let fixture: ComponentFixture<IngresoProduccion_DespachoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IngresoProduccion_DespachoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IngresoProduccion_DespachoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

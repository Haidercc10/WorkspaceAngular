/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { SalidaProduccion_DespachoComponent } from './SalidaProduccion_Despacho.component';

describe('SalidaProduccion_DespachoComponent', () => {
  let component: SalidaProduccion_DespachoComponent;
  let fixture: ComponentFixture<SalidaProduccion_DespachoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SalidaProduccion_DespachoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SalidaProduccion_DespachoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { Reporte_DesperdiciosComponent } from './Reporte_Desperdicios.component';

describe('Reporte_DesperdiciosComponent', () => {
  let component: Reporte_DesperdiciosComponent;
  let fixture: ComponentFixture<Reporte_DesperdiciosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Reporte_DesperdiciosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Reporte_DesperdiciosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

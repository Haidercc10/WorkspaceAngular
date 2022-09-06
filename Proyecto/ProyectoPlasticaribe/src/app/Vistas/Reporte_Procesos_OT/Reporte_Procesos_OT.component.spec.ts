/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { Reporte_Procesos_OTComponent } from './Reporte_Procesos_OT.component';

describe('Reporte_Procesos_OTComponent', () => {
  let component: Reporte_Procesos_OTComponent;
  let fixture: ComponentFixture<Reporte_Procesos_OTComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Reporte_Procesos_OTComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Reporte_Procesos_OTComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
